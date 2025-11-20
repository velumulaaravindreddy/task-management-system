import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '@task-management-system/auth';
import { Role } from '@task-management-system/data';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  async findAll(@CurrentUser() user: any) {
    return this.auditLogService.findAll(user.role, user.organizationId);
  }
}

