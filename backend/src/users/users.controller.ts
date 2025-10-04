import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { AssignManagerDto } from './dto/assign-manager.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserId } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  async create(
    @Body() createUserDto: CreateUserDto,
    @UserId() adminId: string,
  ) {
    return this.usersService.create(createUserDto, adminId);
  }

  @Get()
  async findAll(
    @UserId() userId: string,
    @Query('role') role?: string,
    @Query('managerId') managerId?: string,
  ) {
    return this.usersService.findAll(userId, role, managerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @UserId() requesterId: string) {
    return this.usersService.findById(id, requesterId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserId() adminId: string,
  ) {
    return this.usersService.update(id, updateUserDto, adminId);
  }

  @Patch(':id/role')
  @Roles('ADMIN')
  async changeRole(
    @Param('id') id: string,
    @Body() changeRoleDto: ChangeRoleDto,
    @UserId() adminId: string,
  ) {
    return this.usersService.changeRole(id, changeRoleDto, adminId);
  }

  @Patch(':id/manager')
  @Roles('ADMIN')
  async assignManager(
    @Param('id') id: string,
    @Body() assignManagerDto: AssignManagerDto,
    @UserId() adminId: string,
  ) {
    return this.usersService.assignManager(id, assignManagerDto, adminId);
  }

  @Get(':id/employees')
  async getEmployees(@Param('id') id: string, @UserId() requesterId: string) {
    return this.usersService.getEmployees(id, requesterId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string, @UserId() adminId: string) {
    return this.usersService.remove(id, adminId);
  }
}
