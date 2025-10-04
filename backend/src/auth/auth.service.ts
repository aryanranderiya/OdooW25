import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private companiesService: CompaniesService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async signup(dto: SignupDto) {
    // check existing
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    // create company (auto-detect currency)
    const currency = await this.companiesService.detectCurrency(dto.country);
    const company = await this.prisma.company.create({
      data: { name: dto.companyName, country: dto.country, currency },
    });

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        companyId: company.id,
        role: 'ADMIN',
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      company: {
        id: company.id,
        name: company.name,
        country: company.country,
        currency: company.currency,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        company: true,
        manager: { select: { id: true, name: true, email: true } },
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await this.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        managerId: user.managerId,
        manager: user.manager,
        isManagerApprover: user.isManagerApprover,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        country: user.company.country,
        currency: user.company.currency,
      },
      token,
    };
  }

  generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, { expiresIn: '15d' });
  }
}
