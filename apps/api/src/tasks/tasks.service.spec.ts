import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task, User, Role, TaskStatus } from '@task-management-system/data';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
      };
      const userId = 'user-id';
      const organizationId = 'org-id';

      const mockUser = { id: userId } as User;
      const mockTask = { id: 'task-id', ...createTaskDto } as Task;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, userId, organizationId);

      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(mockTaskRepository.save).toHaveBeenCalled();
    });
  });
});

