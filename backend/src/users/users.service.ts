import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { AssignManagerDto } from './dto/assign-manager.dto';
import { EmailService } from '../auth/email.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  private generateRandomPassword(): string {
    // Generate a random password with letters, numbers, and special characters
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one character from each type
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specials = '!@#$%^&*';

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specials[Math.floor(Math.random() * specials.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  async create(createUserDto: CreateUserDto, adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { company: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create users');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    if (createUserDto.role === 'EMPLOYEE' && !createUserDto.managerId) {
      throw new BadRequestException('Employees must have a manager assigned');
    }

    if (createUserDto.managerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: createUserDto.managerId },
      });

      if (!manager || manager.companyId !== admin.companyId) {
        throw new BadRequestException('Invalid manager');
      }
    }

    // Generate random password if not provided
    const generatedPassword =
      createUserDto.password || this.generateRandomPassword();
    const passwordHash = await this.hashPassword(generatedPassword);

    // Generate email verification token
    const verificationToken = this.generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
        emailVerified: true,
        role: createUserDto.role,
        companyId: admin.companyId,
        managerId: createUserDto.managerId,
        isManagerApprover: createUserDto.isManagerApprover || false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        company: true,
      },
    });

    // Send email with credentials and verification email
    try {
      await this.emailService.sendUserCredentialsEmail(
        user.email,
        user.name,
        generatedPassword,
        user.company.name,
      );

      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send user emails:', error);
      // Don't throw error here to avoid rolling back user creation
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
      manager: user.manager,
      isManagerApprover: user.isManagerApprover,
      companyId: user.companyId,
      company: user.company,
      createdAt: user.createdAt,
    };
  }

  async findAll(userId: string, role?: string, managerId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const where: any = { companyId: user.companyId };

    if (role) {
      where.role = role;
    }

    if (managerId) {
      where.managerId = managerId;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        manager: { select: { id: true, name: true, email: true } },
        isManagerApprover: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async findById(id: string, requesterId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true, role: true } },
        employees: {
          select: { id: true, name: true, email: true, role: true },
        },
        company: true,
      },
    });

    if (!user || user.companyId !== requester.companyId) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
      manager: user.manager,
      employees: user.employees,
      isManagerApprover: user.isManagerApprover,
      companyId: user.companyId,
      company: user.company,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update users');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.companyId !== admin.companyId) {
      throw new NotFoundException('User not found');
    }

    const finalRole = updateUserDto.role || user.role;
    const finalManagerId =
      updateUserDto.managerId !== undefined
        ? updateUserDto.managerId
        : user.managerId;

    if (finalRole === 'EMPLOYEE' && !finalManagerId) {
      throw new BadRequestException('Employees must have a manager assigned');
    }

    if (updateUserDto.managerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: updateUserDto.managerId },
      });

      if (!manager || manager.companyId !== admin.companyId) {
        throw new BadRequestException('Invalid manager');
      }

      if (manager.id === user.id) {
        throw new BadRequestException('User cannot be their own manager');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: updateUserDto.name,
        role: updateUserDto.role,
        managerId: updateUserDto.managerId,
        isManagerApprover: updateUserDto.isManagerApprover,
      },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        company: true,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      managerId: updatedUser.managerId,
      manager: updatedUser.manager,
      isManagerApprover: updatedUser.isManagerApprover,
      companyId: updatedUser.companyId,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async changeRole(id: string, changeRoleDto: ChangeRoleDto, adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change roles');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.companyId !== admin.companyId) {
      throw new NotFoundException('User not found');
    }

    if (changeRoleDto.role === 'EMPLOYEE' && !user.managerId) {
      throw new BadRequestException(
        'Cannot change to EMPLOYEE role without a manager assigned',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role: changeRoleDto.role },
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async assignManager(
    id: string,
    assignManagerDto: AssignManagerDto,
    adminId: string,
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can assign managers');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.companyId !== admin.companyId) {
      throw new NotFoundException('User not found');
    }

    const manager = await this.prisma.user.findUnique({
      where: { id: assignManagerDto.managerId },
    });

    if (!manager || manager.companyId !== admin.companyId) {
      throw new BadRequestException('Invalid manager');
    }

    if (manager.id === user.id) {
      throw new BadRequestException('User cannot be their own manager');
    }

    if (user.role === 'EMPLOYEE' && !assignManagerDto.managerId) {
      throw new BadRequestException('Cannot remove manager from an employee');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { managerId: assignManagerDto.managerId },
      include: {
        manager: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      managerId: updatedUser.managerId,
      manager: updatedUser.manager,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async getEmployees(id: string, requesterId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.companyId !== requester.companyId) {
      throw new NotFoundException('User not found');
    }

    const employees = await this.prisma.user.findMany({
      where: { managerId: id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isManagerApprover: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return employees;
  }

  async remove(id: string, adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete users');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.companyId !== admin.companyId) {
      throw new NotFoundException('User not found');
    }

    if (user.id === admin.id) {
      throw new BadRequestException('Cannot delete yourself');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
