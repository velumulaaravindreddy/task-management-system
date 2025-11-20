import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, Role } from '@task-management-system/data';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        role: Role.ADMIN,
      } as User;

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
    });

    it('should return null if credentials are invalid', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });
});

