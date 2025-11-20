import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, OrganizationDetails, Organization, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-organization-settings',
  templateUrl: './organization-settings.component.html',
  styleUrls: ['./organization-settings.component.css'],
})
export class OrganizationSettingsComponent implements OnInit {
  organization: OrganizationDetails | null = null;
  loading = false;
  error = '';
  currentUser: any = null;
  
  // Modal states
  showEditNameModal = false;
  showDeleteModal = false;
  showTransferModal = false;
  
  editNameForm: FormGroup;
  actionLoading = false;
  actionError = '';
  users: User[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.editNameForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user?.organizationId) {
        this.loadOrganizationDetails();
        this.loadUsers();
      }
    });
  }

  loadOrganizationDetails(): void {
    if (!this.currentUser?.organizationId) return;
    
    this.loading = true;
    this.error = '';
    this.userService.getOrganizationDetails(this.currentUser.organizationId).subscribe({
      next: (org) => {
        this.organization = org;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading organization:', err);
        if (err.status === 403) {
          this.error = 'You do not have permission to view organization settings. Only Owners can access this page.';
        } else if (err.status === 401) {
          this.error = 'Authentication required. Please log in again.';
        } else {
          this.error = err.error?.message || err.message || 'Failed to load organization details. Please try again.';
        }
        this.loading = false;
      },
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Error loading users:', err);
      },
    });
  }

  openEditNameModal(): void {
    if (this.organization) {
      this.editNameForm.patchValue({ name: this.organization.name });
      this.showEditNameModal = true;
      this.actionError = '';
    }
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.actionError = '';
  }

  openTransferModal(): void {
    this.showTransferModal = true;
    this.selectedTransferUser = null;
    this.actionError = '';
  }

  closeModals(): void {
    this.showEditNameModal = false;
    this.showDeleteModal = false;
    this.showTransferModal = false;
    this.actionError = '';
  }

  updateOrganizationName(): void {
    if (this.editNameForm.valid && this.organization) {
      this.actionLoading = true;
      this.actionError = '';
      const newName = this.editNameForm.value.name;
      
      this.userService.updateOrganizationName(this.organization.id, newName).subscribe({
        next: () => {
          this.loadOrganizationDetails();
          this.closeModals();
          this.actionLoading = false;
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to update organization name';
          this.actionLoading = false;
        },
      });
    }
  }

  deleteOrganization(): void {
    if (this.organization) {
      this.actionLoading = true;
      this.actionError = '';
      
      this.userService.deleteOrganization(this.organization.id).subscribe({
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

  selectedTransferUser: User | null = null;

  selectTransferUser(user: User): void {
    if (user.id === this.currentUser?.id) return;
    this.selectedTransferUser = user;
  }

  confirmTransferOwnership(): void {
    if (!this.selectedTransferUser) return;
    
    this.actionLoading = true;
    this.actionError = '';
    
    this.userService.transferOwnership(this.selectedTransferUser.id).subscribe({
      next: () => {
        this.loadOrganizationDetails();
        this.closeModals();
        this.selectedTransferUser = null;
        this.actionLoading = false;
        alert('Ownership transferred successfully. Please refresh the page to see your updated role.');
      },
      error: (err) => {
        this.actionError = err.error?.message || 'Failed to transfer ownership';
        this.actionLoading = false;
      },
    });
  }

  getParentOrgName(): string {
    if (this.organization?.parent) {
      return this.organization.parent.name;
    }
    return 'None (Root Organization)';
  }

  getSubOrganizations(): Organization[] {
    return this.organization?.children || [];
  }
}

