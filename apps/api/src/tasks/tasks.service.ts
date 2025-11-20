import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, CreateTaskDto, UpdateTaskDto, Role, TaskStatus, User } from '@task-management-system/data';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string, organizationId: string): Promise<Task> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let assigneeId: string | undefined;
    if (createTaskDto.assignedToId) {
      const assignee = await this.usersRepository.findOne({
        where: { id: createTaskDto.assignedToId, organizationId },
      });
      if (!assignee) {
        throw new BadRequestException('Assignee must belong to your organization');
      }
      assigneeId = assignee.id;
    }

    const task = this.tasksRepository.create({
      ...createTaskDto,
      createdById: userId,
      organizationId,
      status: createTaskDto.status || TaskStatus.TODO,
      assignedToId: assigneeId,
    });

    return this.tasksRepository.save(task);
  }

  async findAll(userId: string, userRole: Role, organizationId: string): Promise<Task[]> {
    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.organization', 'organization')
      .where('task.organizationId = :organizationId', { organizationId });

    // Viewers can only see tasks
    if (userRole === Role.VIEWER) {
      return queryBuilder.getMany();
    }

    // Owners and Admins can see all tasks in their org
    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string, userRole: Role, organizationId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo', 'organization'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check organization access
    if (task.organizationId !== organizationId) {
      throw new ForbiddenException('Cannot access task from other organization');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
    userRole: Role,
    organizationId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, userId, userRole, organizationId);

    // Viewers cannot update
    if (userRole === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot update tasks');
    }

    if (updateTaskDto.assignedToId !== undefined) {
      if (updateTaskDto.assignedToId === null || updateTaskDto.assignedToId === '') {
        task.assignedToId = null as any;
      } else {
        const assignee = await this.usersRepository.findOne({
          where: { id: updateTaskDto.assignedToId, organizationId },
        });
        if (!assignee) {
          throw new BadRequestException('Assignee must belong to your organization');
        }
        task.assignedToId = assignee.id;
      }
      delete (updateTaskDto as any).assignedToId;
    }

    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string, userId: string, userRole: Role, organizationId: string): Promise<void> {
    const task = await this.findOne(id, userId, userRole, organizationId);

    // Only Owners and Admins can delete
    if (userRole === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }

    await this.tasksRepository.remove(task);
  }
}

