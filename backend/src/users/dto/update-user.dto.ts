export class UpdateUserDto {
  name?: string;
  role?: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  managerId?: string;
  isManagerApprover?: boolean;
}
