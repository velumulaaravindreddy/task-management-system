import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@task-management-system/data';

@Injectable()
export class OrganizationAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceOrgId = request.body?.organizationId || request.params?.organizationId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Owners and Admins can access their org and child orgs
    if (user.role === Role.OWNER || user.role === Role.ADMIN) {
      // In a real implementation, we'd check org hierarchy here
      // For now, users can only access their own organization
      if (resourceOrgId && resourceOrgId !== user.organizationId) {
        throw new ForbiddenException('Cannot access resources from other organizations');
      }
      return true;
    }

    // Viewers can only access their own org
    if (user.role === Role.VIEWER) {
      if (resourceOrgId && resourceOrgId !== user.organizationId) {
        throw new ForbiddenException('Cannot access resources from other organizations');
      }
      return true;
    }

    return false;
  }
}

