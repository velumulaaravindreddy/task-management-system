import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskStatus } from '../../../../../libs/data/src/index-frontend';

export interface TaskUserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Complete Task Interface
 * Matches backend entity structure with all required and optional fields
 */
export interface Task {
  // Visible fields
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: number; // 1 = Low, 2 = Medium, 3 = High, 4 = Urgent
  status: TaskStatus;
  assignedToId?: string;
  assignedTo?: TaskUserRef | null;
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Hidden/system fields
  createdById: string;
  organizationId: string;
  createdBy?: TaskUserRef;
}

/**
 * Create/Update Task DTO
 * Fields that can be set when creating or updating a task
 */
export interface CreateTaskDto {
  title: string; // Required
  description?: string;
  category?: string;
  priority?: number; // 1 = Low, 2 = Medium, 3 = High, 4 = Urgent
  status?: TaskStatus;
  assignedToId?: string;
  dueDate?: string; // ISO date string
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }

  updateTask(id: string, task: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }
}

