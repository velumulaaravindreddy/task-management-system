import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Organization, Task, Role, UserStatus, CreateUserDto } from '@task-management-system/data';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: Role,
    organizationId?: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      organizationId,
    });

    return this.usersRepository.save(user);
  }
  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  async inviteUser(
    createUserDto: CreateUserDto,
    currentUserRole: Role,
    currentUserOrgId: string,
  ): Promise<{ user: User; temporaryPassword: string }> {
    if (currentUserRole === Role.ADMIN && createUserDto.role === Role.OWNER) {
      throw new ForbiddenException('Admins cannot create Owner users');
    }

    const targetOrgId = createUserDto.organizationId || currentUserOrgId;

    if (currentUserRole === Role.ADMIN && targetOrgId !== currentUserOrgId) {
      throw new ForbiddenException('Admins can only create users in their organization');
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id: targetOrgId },
      relations: ['parent'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const temporaryPassword = createUserDto.password || this.generateTemporaryPassword();
    const user = await this.createUser(
      createUserDto.email,
      temporaryPassword,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.role,
      targetOrgId,
    );

    const userWithRelations = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['organization'],
    });

    return {
      user: userWithRelations!,
      temporaryPassword,
    };
  }


  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['organization'],
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'organizationId', 'status', 'lastLogin', 'createdAt', 'updatedAt'],
    });
  }

  async findAllOrganizations(): Promise<Organization[]> {
    return this.organizationsRepository.find({
      relations: ['parent'],
      order: { name: 'ASC' },
    });
  }

  async updateUser(
    id: string,
    updates: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: Role;
      status?: UserStatus;
      organizationId?: string;
    },
    currentUserRole: Role,
    currentUserId: string,
  ): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Admins cannot change roles to Owner or change Owner roles
    if (currentUserRole === Role.ADMIN) {
      if (updates.role === Role.OWNER || user.role === Role.OWNER) {
        throw new ForbiddenException('Admins cannot change roles to Owner or modify Owner users');
      }
    }

    // Cannot change your own role
    if (id === currentUserId && updates.role && updates.role !== user.role) {
      throw new BadRequestException('Cannot change your own role');
    }

    Object.assign(user, updates);
    return this.usersRepository.save(user);
  }

  async deleteUser(id: string, currentUserRole: Role, currentUserId: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cannot delete yourself
    if (user.id === currentUserId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    // Admins cannot delete Owner users
    if (currentUserRole === Role.ADMIN && user.role === Role.OWNER) {
      throw new ForbiddenException('Admins cannot delete Owner users');
    }

    await this.usersRepository.remove(user);
  }

  async changeUserRole(id: string, newRole: Role, currentUserRole: Role, currentUserId: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only Owner can change roles
    if (currentUserRole !== Role.OWNER) {
      throw new ForbiddenException('Only Owner can change user roles');
    }

    // Cannot change your own role
    if (user.id === currentUserId) {
      throw new BadRequestException('Cannot change your own role');
    }

    user.role = newRole;
    return this.usersRepository.save(user);
  }

  async deleteOrganization(orgId: string, currentUserRole: Role, currentUserId: string): Promise<void> {
    if (currentUserRole !== Role.OWNER) {
      throw new ForbiddenException('Only Owner can delete organization');
    }

    const org = await this.organizationsRepository.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Check if current user is the owner of this organization
    const currentUser = await this.findOne(currentUserId);
    if (currentUser.organizationId !== orgId) {
      throw new ForbiddenException('Can only delete your own organization');
    }

    // Check if there are other Owner users in the organization
    const ownerCount = await this.usersRepository.count({
      where: { organizationId: orgId, role: Role.OWNER },
    });

    if (ownerCount > 1) {
      throw new BadRequestException('Cannot delete organization with multiple owners. Transfer ownership first.');
    }

    await this.organizationsRepository.remove(org);
  }

  async transferOwnership(
    targetUserId: string,
    currentUserRole: Role,
    currentUserId: string,
  ): Promise<User> {
    if (currentUserRole !== Role.OWNER) {
      throw new ForbiddenException('Only Owner can transfer ownership');
    }

    const targetUser = await this.findOne(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Target user must be in the same organization
    const currentUser = await this.findOne(currentUserId);
    if (targetUser.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException('Can only transfer ownership to users in the same organization');
    }

    // Transfer ownership: make target user Owner, make current user Admin
    targetUser.role = Role.OWNER;
    currentUser.role = Role.ADMIN;

    await this.usersRepository.save([targetUser, currentUser]);
    return targetUser;
  }

  async toggleUserStatus(id: string, currentUserRole: Role, currentUserId: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cannot deactivate yourself
    if (user.id === currentUserId) {
      throw new BadRequestException('Cannot change your own status');
    }

    // Admins cannot deactivate Owner users
    if (currentUserRole === Role.ADMIN && user.role === Role.OWNER) {
      throw new ForbiddenException('Admins cannot change status of Owner users');
    }

    user.status = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    return this.usersRepository.save(user);
  }

  async getOrganizationDetails(organizationId: string): Promise<any> {
    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId },
      relations: ['parent', 'children'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Get user count
    const userCount = await this.usersRepository.count({
      where: { organizationId },
    });

    // Get task count
    const taskCount = await this.tasksRepository.count({
      where: { organizationId },
    });

    // Get owner
    const owner = await this.usersRepository.findOne({
      where: { organizationId, role: Role.OWNER },
      select: ['id', 'firstName', 'lastName', 'email'],
    });

    return {
      ...organization,
      userCount,
      taskCount,
      owner: owner ? {
        id: owner.id,
        name: `${owner.firstName} ${owner.lastName}`,
        email: owner.email,
      } : null,
    };
  }

  async updateOrganizationName(organizationId: string, name: string, currentUserRole: Role): Promise<Organization> {
    if (currentUserRole !== Role.OWNER) {
      throw new ForbiddenException('Only Owner can update organization name');
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    organization.name = name;
    return this.organizationsRepository.save(organization);
  }
}

