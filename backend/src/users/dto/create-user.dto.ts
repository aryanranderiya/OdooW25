export class CreateUserDto {
  name: string;
  email: string;
  password?: string; // Make password optional since we'll generate it
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  managerId?: string;
  isManagerApprover?: boolean;
}
