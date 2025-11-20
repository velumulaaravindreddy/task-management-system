import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@task-management-system/data';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /** Create an audit log entry */
  async log(
    action: string,
    resource: string,
    resourceId: string | null,
    userId: string,
    details?: string,
  ): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      action,
      resource,
      resourceId,
      userId,
      details: details || null,
      timestamp: new Date(),
    });

    const savedLog = await this.auditLogRepository.save(log);

    // Visible console output
    console.log(
      `[AUDIT] ${action} ${resource}${resourceId ? ` (${resourceId})` : ''} by user ${userId} - ${details || ''}`,
    );

    return savedLog;
  }

  /** Fetch logs (Owners/Admins only) */
  async findAll(userRole: string, organizationId?: string): Promise<AuditLog[]> {
    const qb = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .orderBy('auditLog.timestamp', 'DESC');

    // Restrict non-Owner access by organization
    if (organizationId && userRole !== 'Owner') {
      qb.where('user.organizationId = :organizationId', { organizationId });
    }

    return qb.getMany();
  }
}
