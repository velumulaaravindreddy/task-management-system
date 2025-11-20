import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
  };
  status: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  parent?: Organization;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organizationId?: string;
  password?: string;
}

export interface InviteUserResponse {
  user: User;
  temporaryPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  updateUser(id: string, updates: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, updates);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${id}`);
  }

  changeUserRole(id: string, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  deleteOrganization(orgId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/organization/${orgId}`);
  }

  transferOwnership(userId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/${userId}/transfer-ownership`, {});
  }

  toggleUserStatus(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/status`, {});
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.apiUrl}/users/organizations`);
  }

  getOrganizationDetails(organizationId: string): Observable<OrganizationDetails> {
    return this.http.get<OrganizationDetails>(`${this.apiUrl}/users/organization/${organizationId}`);
  }

  updateOrganizationName(organizationId: string, name: string): Observable<Organization> {
    return this.http.patch<Organization>(`${this.apiUrl}/users/organization/${organizationId}/name`, { name });
  }
  inviteUser(payload: CreateUserRequest): Observable<InviteUserResponse> {
    return this.mapUserResponse(this.http.post<InviteUserResponse>(`${this.apiUrl}/users`, payload));
  }

  private mapUserResponse<T extends { user: User }>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      map((response) => {
        const userWithOrg = response.user;
        if (userWithOrg && userWithOrg.organizationId && !userWithOrg.organization) {
          const org = this.organizationsCache?.get(userWithOrg.organizationId);
          if (org) {
            (response.user as any).organization = org;
          }
        }
        return response;
      }),
    );
  }

  private organizationsCache = new Map<string, Organization>();

  cacheOrganizations(orgs: Organization[]): void {
    orgs.forEach((org) => this.organizationsCache.set(org.id, org));
  }
}

export interface OrganizationDetails {
  id: string;
  name: string;
  parentId?: string;
  parent?: Organization;
  children?: Organization[];
  userCount: number;
  taskCount: number;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

