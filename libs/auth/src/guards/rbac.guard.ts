import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@task-management-system/data';

@Injectable()
export class RbacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resource = request.params;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Role hierarchy: Owner > Admin > Viewer
    const roleHierarchy: Record<Role, number> = {
      [Role.OWNER]: 3,
      [Role.ADMIN]: 2,
      [Role.VIEWER]: 1,
    };

    // Owners and Admins have full access
    if (user.role === Role.OWNER || user.role === Role.ADMIN) {
      return true;
    }

    // Viewers can only read
    const method = request.method;
    if (method === 'GET') {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}

