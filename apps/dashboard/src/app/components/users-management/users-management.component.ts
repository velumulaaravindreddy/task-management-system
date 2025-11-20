import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User, UpdateUserDto, Organization } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css'],
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  organizations: Organization[] = [];
  loading = false;
  error = '';
  currentUser: any = null;
  
  // Modal states
  showEditModal = false;
  showDeleteModal = false;
  showRoleModal = false;
  showTransferModal = false;
  showOrgDeleteModal = false;
  showDetailsModal = false;
  showInviteModal = false;
  
  selectedUser: User | null = null;
  editForm: FormGroup;
  roleForm: FormGroup;
  inviteForm: FormGroup;
  
  roles = ['Owner', 'Admin', 'Viewer'];
  statuses = ['Active', 'Inactive'];
  actionLoading = false;
  actionError = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.editForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      organizationId: [''],
      status: ['', [Validators.required]],
    });
    
    this.roleForm = this.fb.group({
      role: ['', [Validators.required]],
    });

    this.inviteForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Viewer', [Validators.required]],
      organizationId: [''],
      password: [''],
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadUsers();
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.userService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.userService.cacheOrganizations(orgs);
      },
      error: (err) => {
        console.error('Error loading organizations:', err);
      },
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        if (err.status === 403) {
          this.error = 'You do not have permission to view users. Only Owners and Admins can access this page.';
        } else if (err.status === 401) {
          this.error = 'Authentication required. Please log in again.';
        } else {
          this.error = err.error?.message || err.message || 'Failed to load users. Please try again.';
        }
        this.loading = false;
      },
    });
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    this.editForm.patchValue({
      fullName: fullName,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || '',
      status: user.status || 'Active',
    });
    this.showEditModal = true;
    this.actionError = '';
  }

  openDeleteModal(user: User): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
    this.actionError = '';
  }

  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.roleForm.patchValue({ role: user.role });
    this.showRoleModal = true;
    this.actionError = '';
  }

  openTransferModal(user: User): void {
    this.selectedUser = user;
    this.showTransferModal = true;
    this.actionError = '';
  }

  openOrgDeleteModal(): void {
    this.showOrgDeleteModal = true;
    this.actionError = '';
  }

  openInviteModal(): void {
    const defaultOrgId = this.currentUser?.role === 'Owner' ? '' : this.currentUser?.organizationId || '';
    this.inviteForm.reset({
      fullName: '',
      email: '',
      role: 'Viewer',
      organizationId: defaultOrgId,
      password: '',
    });
    this.showInviteModal = true;
    this.actionError = '';
  }

  openDetailsModal(user: User): void {
    this.selectedUser = user;
    this.showDetailsModal = true;
  }

  closeModals(): void {
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showRoleModal = false;
    this.showTransferModal = false;
    this.showOrgDeleteModal = false;
    this.showDetailsModal = false;
    this.showInviteModal = false;
    this.selectedUser = null;
    this.actionError = '';
  }

  inviteUser(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    this.actionLoading = true;
    this.actionError = '';
    const { fullName, email, role, organizationId, password } = this.inviteForm.value;
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.userService
      .inviteUser({
        firstName,
        lastName: lastName || '',
        email,
        role,
        organizationId: organizationId || undefined,
        password: password || undefined,
      })
      .subscribe({
        next: (res) => {
          this.loadUsers();
          this.closeModals();
          this.actionLoading = false;
          alert(`User invited successfully. Temporary password: ${res.temporaryPassword}`);
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to invite user';
          this.actionLoading = false;
        },
      });
  }

  updateUser(): void {
    if (this.editForm.valid && this.selectedUser) {
      this.actionLoading = true;
      this.actionError = '';
      const formValue = this.editForm.value;
      
      // Split full name into first and last name
      const nameParts = formValue.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const updates: UpdateUserDto = {
        firstName,
        lastName,
        email: formValue.email,
        role: formValue.role,
        status: formValue.status,
        organizationId: formValue.organizationId || undefined,
      };
      
      this.userService.updateUser(this.selectedUser.id, updates).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModals();
          this.actionLoading = false;
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to update user';
          this.actionLoading = false;
        },
      });
    }
  }

  deleteUserFromEdit(): void {
    if (this.selectedUser) {
      this.closeModals();
      this.openDeleteModal(this.selectedUser);
    }
  }

  getOrganizationDisplayName(org: Organization): string {
    if (org.parent) {
      return `${org.parent.name} > ${org.name}`;
    }
    return org.name;
  }

  deleteUser(): void {
    if (this.selectedUser) {
      this.actionLoading = true;
      this.actionError = '';
      
      this.userService.deleteUser(this.selectedUser.id).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModals();
          this.actionLoading = false;
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to delete user';
          this.actionLoading = false;
        },
      });
    }
  }

  changeRole(): void {
    if (this.roleForm.valid && this.selectedUser) {
      this.actionLoading = true;
      this.actionError = '';
      const newRole = this.roleForm.value.role;
      
      this.userService.changeUserRole(this.selectedUser.id, newRole).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModals();
          this.actionLoading = false;
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to change user role';
          this.actionLoading = false;
        },
      });
    }
  }

  transferOwnership(): void {
    if (this.selectedUser) {
      this.actionLoading = true;
      this.actionError = '';
      
      this.userService.transferOwnership(this.selectedUser.id).subscribe({
        next: () => {
          // Reload users - user will need to refresh page to see role change
          this.loadUsers();
          this.closeModals();
          this.actionLoading = false;
          // Show message that page refresh is needed
          alert('Ownership transferred successfully. Please refresh the page to see your updated role.');
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to transfer ownership';
          this.actionLoading = false;
        },
      });
    }
  }

  deleteOrganization(): void {
    if (this.currentUser?.organizationId) {
      this.actionLoading = true;
      this.actionError = '';
      
      this.userService.deleteOrganization(this.currentUser.organizationId).subscribe({
        next: () => {
          this.authService.logout();
          this.closeModals();
          this.actionLoading = false;
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to delete organization';
          this.actionLoading = false;
        },
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.actionLoading = true;
    this.actionError = '';
    
    this.userService.toggleUserStatus(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.actionLoading = false;
      },
      error: (err) => {
        this.actionError = err.error?.message || 'Failed to change user status';
        this.actionLoading = false;
      },
    });
  }

  canToggleStatus(user: User): boolean {
    if (user.id === this.currentUser?.id) return false;
    if (this.currentUser?.role === 'Owner') return true;
    if (this.currentUser?.role === 'Admin') {
      return user.role !== 'Owner';
    }
    return false;
  }

  getStatusBadgeClass(status: string): string {
    return status === 'Active' ? 'status-badge status-active' : 'status-badge status-inactive';
  }

  canInviteUsers(): boolean {
    return this.currentUser?.role === 'Owner' || this.currentUser?.role === 'Admin';
  }

  goToManageUsers(): void {
    this.router.navigate(['/users']);
  }

  goToAuditLogs(): void {
    this.router.navigate(['/audit-log']);
  }

  goToOrganizationSettings(): void {
    this.router.navigate(['/organization']);
  }

  canEditUser(user: User): boolean {
    if (this.currentUser?.role === 'Owner') return true;
    if (this.currentUser?.role === 'Admin') {
      return user.role !== 'Owner';
    }
    return false;
  }

  canDeleteUser(user: User): boolean {
    if (user.id === this.currentUser?.id) return false;
    if (this.currentUser?.role === 'Owner') return true;
    if (this.currentUser?.role === 'Admin') {
      return user.role !== 'Owner';
    }
    return false;
  }

  canChangeRole(user: User): boolean {
    return this.currentUser?.role === 'Owner' && user.id !== this.currentUser?.id;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Owner':
        return 'role-badge role-badge-owner';
      case 'Admin':
        return 'role-badge role-badge-admin';
      case 'Viewer':
        return 'role-badge role-badge-viewer';
      default:
        return 'role-badge';
    }
  }
}

