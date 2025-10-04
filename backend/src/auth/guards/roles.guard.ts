import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Role hierarchy: ADMIN > MANAGER > EMPLOYEE
const ROLE_HIERARCHY = {
  ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoleLevel =
      ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY];

    // Check if user's role level meets or exceeds any of the required roles
    // Admin can do everything, Manager can do Manager + Employee tasks, etc.
    const hasPermission = requiredRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
      return userRoleLevel >= requiredLevel;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
