import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { User, Organization, Task, AuditLog } from '@task-management-system/data';
import { seedDatabase } from '../seed';
import { seedTasks } from '../seed-tasks';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'task-management.db',
      entities: [User, Organization, Task, AuditLog],
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    AuditLogModule,
    NotificationsModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    // Always ensure seed data exists (creates or updates users)
    try {
      await seedDatabase(this.dataSource);
      // Seed tasks after users are created
      await seedTasks(this.dataSource);
    } catch (error) {
      console.error('❌ Error seeding database:', error);
    }
  }
}

