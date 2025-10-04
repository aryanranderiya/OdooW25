export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  managerId?: string;
  isManagerApprover?: boolean;
}
