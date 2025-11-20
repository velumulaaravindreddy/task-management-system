import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '@task-management-system/data';
import { JwtAuthGuard, RbacGuard, CurrentUser } from '@task-management-system/auth';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: any,
  ) {
    const task = await this.tasksService.create(
      createTaskDto,
      user.id,
      user.organizationId,
    );
    
    await this.auditLogService.log(
      'CREATE',
      'Task',
      task.id,
      user.id,
      `Created task: ${task.title}`,
    );

    return task;
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    const tasks = await this.tasksService.findAll(
      user.id,
      user.role,
      user.organizationId,
    );
    
    await this.auditLogService.log(
      'READ',
      'Task',
      null,
      user.id,
      'Listed all tasks',
    );

    return tasks;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const task = await this.tasksService.findOne(id, user.id, user.role, user.organizationId);
    
    await this.auditLogService.log(
      'READ',
      'Task',
      id,
      user.id,
      `Viewed task: ${task.title}`,
    );

    return task;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    const task = await this.tasksService.update(
      id,
      updateTaskDto,
      user.id,
      user.role,
      user.organizationId,
    );
    
    await this.auditLogService.log(
      'UPDATE',
      'Task',
      id,
      user.id,
      `Updated task: ${task.title}`,
    );

    return task;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.tasksService.remove(id, user.id, user.role, user.organizationId);
    
    await this.auditLogService.log(
      'DELETE',
      'Task',
      id,
      user.id,
      `Deleted task with id: ${id}`,
    );

    return { message: 'Task deleted successfully' };
  }
}

