import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { WorkflowService } from '../../services/workflow.service';
import { TaskStatus } from '../../../../../../libs/data/src/index-frontend';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit, OnDestroy {
  @Output() createTask = new EventEmitter<void>();

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  categories: string[] = [];
  showModal = false;
  selectedTask: Task | null = null;
  currentUser: any = null;
  TaskStatus = TaskStatus; // Expose enum to template

  private createTaskHandler = () => this.openCreateModal();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private workflowService: WorkflowService,
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.filterTasks();
      }
    });

    // Listen for create task event from header
    window.addEventListener('createTask', this.createTaskHandler);
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filterTasks();
        this.extractCategories();
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      },
    });
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter((task) => {
      const matchesSearch =
        !this.searchTerm ||
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = !this.statusFilter || task.status === this.statusFilter;
      const matchesCategory =
        !this.categoryFilter || task.category === this.categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  extractCategories(): void {
    const cats = new Set<string>();
    this.tasks.forEach((task) => {
      if (task.category) {
        cats.add(task.category);
      }
    });
    this.categories = Array.from(cats);
  }

  isOwnerView(): boolean {
    return this.currentUser?.role === 'Owner';
  }

  formatStatus(status: string): string {
    return this.workflowService.formatStatus(status);
  }

    getUserName(user?: { firstName: string; lastName: string }): string {
      if (!user) {
        return 'Unassigned';
      }
      return `${user.firstName} ${user.lastName}`;
    }

    getInitials(user?: { firstName: string; lastName: string }): string {
      if (!user) return 'NA';
      const first = user.firstName?.charAt(0) || '';
      const last = user.lastName?.charAt(0) || '';
      return `${first}${last}`.toUpperCase();
    }

    getPriorityLabel(priority: number): string {
      switch (priority) {
        case 4:
          return 'Urgent';
        case 3:
          return 'High';
        case 2:
          return 'Medium';
        case 1:
          return 'Low';
        default:
          return 'Low';
      }
    }

    canDropToStatus(fromStatus: TaskStatus, toStatus: TaskStatus): boolean {
      return this.workflowService.isValidTransition(fromStatus, toStatus);
    }

  getTasksByStatus(status: TaskStatus | string): Task[] {
    return this.filteredTasks.filter((task) => task.status === status);
  }

  getCompletionPercentage(): number {
    if (this.filteredTasks.length === 0) return 0;
    const closedCount = this.getTasksByStatus(TaskStatus.CLOSED).length;
    return Math.round((closedCount / this.filteredTasks.length) * 100);
  }

  openCreateModal(): void {
    this.selectedTask = null;
    this.showModal = true;
  }

  openEditModal(task: Task): void {
    this.selectedTask = task;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTask = null;
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err) => {
          console.error('Error deleting task:', err);
          alert('Failed to delete task');
        },
      });
    }
  }

  canCreateTask(): boolean {
    return this.currentUser?.role === 'Owner' || this.currentUser?.role === 'Admin';
  }

  canEditTask(): boolean {
    return this.currentUser?.role === 'Owner' || this.currentUser?.role === 'Admin';
  }

  canDeleteTask(): boolean {
    return this.currentUser?.role === 'Owner' || this.currentUser?.role === 'Admin';
  }

  // Drag and Drop
  draggedTask: Task | null = null;
  isDragging = false;
  dragOverColumn: string | null = null;

  onTaskDragStart(task: Task): void {
    this.draggedTask = task;
    this.isDragging = true;
  }

  onTaskDragEnd(): void {
    this.isDragging = false;
    this.dragOverColumn = null;
    // Don't clear draggedTask here, wait for drop or cancel
  }

  onDragOver(event: DragEvent, status: string): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    this.dragOverColumn = status;
  }

  onDragEnter(event: DragEvent, status: string): void {
    event.preventDefault();
    this.dragOverColumn = status;
  }

  onDragLeave(event: DragEvent): void {
    // Only clear if we're actually leaving the column (not just moving to a child element)
    const relatedTarget = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      this.dragOverColumn = null;
    }
  }

  onDrop(event: DragEvent, newStatus: TaskStatus | string): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging = false;
    this.dragOverColumn = null;
    
    // Get task from dataTransfer or use tracked task
    let taskToUpdate: Task | null = this.draggedTask;
    
    if (!taskToUpdate && event.dataTransfer) {
      try {
        const taskData = event.dataTransfer.getData('application/json');
        if (taskData) {
          taskToUpdate = JSON.parse(taskData);
        } else {
          const taskId = event.dataTransfer.getData('text/plain');
          taskToUpdate = this.tasks.find(t => t.id === taskId) || null;
        }
      } catch (e) {
        console.error('Error parsing drag data:', e);
      }
    }
    
    if (taskToUpdate && taskToUpdate.status !== newStatus) {
      // Validate transition using workflow service
      const isValid = this.workflowService.isValidTransition(
        taskToUpdate.status as TaskStatus,
        newStatus as TaskStatus
      );
      
      if (!isValid) {
        alert(`Cannot move task from "${this.workflowService.formatStatus(taskToUpdate.status)}" to "${this.workflowService.formatStatus(newStatus as TaskStatus)}"`);
        this.draggedTask = null;
        return;
      }
      
      this.taskService
        .updateTask(taskToUpdate.id, { status: newStatus as TaskStatus })
        .subscribe({
          next: () => {
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error updating task status:', err);
            alert('Failed to update task status');
          },
        });
    }
    
    this.draggedTask = null;
  }

  ngOnDestroy(): void {
    window.removeEventListener('createTask', this.createTaskHandler);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Ctrl/Cmd + K: Quick search focus
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('.filter-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Delete key: Delete selected task (if modal is open with a task)
    if (event.key === 'Delete' && this.showModal && this.selectedTask && this.canDeleteTask()) {
      event.preventDefault();
      if (confirm('Are you sure you want to delete this task?')) {
        this.deleteTask(this.selectedTask.id);
        this.closeModal();
      }
    }
  }
}
