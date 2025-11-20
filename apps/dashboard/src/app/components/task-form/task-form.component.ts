import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
import { UserService, User } from '../../services/user.service';
import { TaskStatus } from '../../../../../../libs/data/src/index-frontend';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
})
export class TaskFormComponent implements OnInit, OnDestroy {
  @Input() task: Task | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  taskForm: FormGroup;
  loading = false;
  error = '';
  users: User[] = [];
  private modalShortcutListener: (event: KeyboardEvent) => void;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService,
    private ngZone: NgZone,
  ) {
    this.modalShortcutListener = (event: KeyboardEvent) =>
      this.ngZone.run(() => this.handleGlobalKeydown(event));
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      status: [TaskStatus.NEW],
      priority: [2], // 1 = Low, 2 = Medium, 3 = High, 4 = Urgent
      category: [''],
      assignedToId: [''],
      dueDate: [''], // Optional date picker
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        status: this.task.status,
        priority: this.task.priority,
        category: this.task.category || '',
        assignedToId: this.task.assignedTo?.id || '',
        dueDate: this.task.dueDate ? this.task.dueDate.split('T')[0] : '',
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.modalShortcutListener, true);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.modalShortcutListener, true);
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.users = [];
      },
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.loading = true;
      this.error = '';

      const { assignedToId, dueDate, ...rest } = this.taskForm.value;
      const taskData = {
        ...rest,
        assignedToId: assignedToId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      const operation = this.task
        ? this.taskService.updateTask(this.task.id, taskData)
        : this.taskService.createTask(taskData);

      operation.subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
          this.close.emit();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save task';
          this.loading = false;
        },
      });
    }
  }

  onStatusChange(event: { taskId: string; newStatus: TaskStatus }): void {
    if (this.task && this.task.id === event.taskId) {
      this.taskForm.patchValue({ status: event.newStatus });
      // Auto-save the status change
      this.taskService.updateTask(event.taskId, { status: event.newStatus }).subscribe({
        next: () => {
          if (this.task) {
            this.task.status = event.newStatus;
          }
          this.saved.emit();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update task status';
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.modalShortcutListener, true);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.modalShortcutListener, true);
    }
  }

  private handleGlobalKeydown(event: KeyboardEvent): void {
    const key = event.key?.toLowerCase();

    // Only handle shortcuts when this modal is open
    const modal = document.querySelector('.modal-overlay');
    if (!modal) return;

    // Escape: Close modal
    if (key === 'escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close.emit();
    }

    // Ctrl/Cmd + Enter: Submit form
    if ((event.ctrlKey || event.metaKey) && key === 'enter') {
      event.preventDefault();
      event.stopPropagation();
      if (this.taskForm.valid && !this.loading) {
        this.onSubmit();
      }
    }
  }
}

