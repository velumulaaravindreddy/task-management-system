import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '@task-management-system/auth';
import { Role, UpdateUserDto, CreateUserDto } from '@task-management-system/data';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async findAll(@CurrentUser() user: any) {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.inviteUser(
      createUserDto,
      user.role,
      user.organizationId,
    );
    return result;
  }

  @Get('organizations')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async findAllOrganizations() {
    return this.usersService.findAllOrganizations();
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updateUser(
      id,
      updateUserDto,
      user.role,
      user.id,
    );
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async changeUserRole(
    @Param('id') id: string,
    @Body('role') newRole: Role,
    @CurrentUser() user: any,
  ) {
    return this.usersService.changeUserRole(id, newRole, user.role, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async deleteUser(@Param('id') id: string, @CurrentUser() user: any) {
    await this.usersService.deleteUser(id, user.role, user.id);
    return { message: 'User deleted successfully' };
  }

  @Delete('organization/:orgId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async deleteOrganization(
    @Param('orgId') orgId: string,
    @CurrentUser() user: any,
  ) {
    await this.usersService.deleteOrganization(orgId, user.role, user.id);
    return { message: 'Organization deleted successfully' };
  }

  @Post(':id/transfer-ownership')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async transferOwnership(
    @Param('id') targetUserId: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.transferOwnership(
      targetUserId,
      user.role,
      user.id,
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async toggleUserStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.toggleUserStatus(id, user.role, user.id);
  }

  @Get('organization/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getOrganizationDetails(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    // Verify user belongs to this organization
    if (user.organizationId !== id) {
      throw new ForbiddenException('Cannot access other organizations');
    }
    return this.usersService.getOrganizationDetails(id);
  }

  @Patch('organization/:id/name')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async updateOrganizationName(
    @Param('id') id: string,
    @Body('name') name: string,
    @CurrentUser() user: any,
  ) {
    // Verify user belongs to this organization
    if (user.organizationId !== id) {
      throw new ForbiddenException('Cannot update other organizations');
    }
    return this.usersService.updateOrganizationName(id, name, user.role);
  }
}

