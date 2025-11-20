import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, User, Organization, AuditLog } from '@task-management-system/data';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Organization, AuditLog]),
    AuditLogModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

