import { Component, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TaskListComponent } from '../task-list/task-list.component';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <!-- Header -->
        <app-header title="Tasks" subtitle="Manage and organize your work">
          <button
            *ngIf="canCreateTask()"
            (click)="openCreateTask()"
            class="new-task-btn"
            title="Create New Task (Ctrl+N or Cmd+N)"
          >
            <svg class="new-task-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"></path>
            </svg>
            <span class="new-task-label">New Task</span>
          </button>
        </app-header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          <div class="p-6">
            <app-task-list></app-task-list>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .new-task-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
      position: relative;
      overflow: hidden;
    }

    .new-task-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .new-task-btn:hover::before {
      left: 100%;
    }
    
    .new-task-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
      background: linear-gradient(135deg, #7c3aed, #a855f7);
    }
    
    .new-task-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }
    
    .new-task-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      transition: transform 0.3s ease;
      position: relative;
      z-index: 1;
    }

    
    .new-task-btn:hover .new-task-icon {
      transform: rotate(5deg) scale(1.1);
    }
    
    .new-task-label {
      position: relative;
      z-index: 1;
    }

    .keyboard-hint {
      font-size: 10px;
      opacity: 0.7;
      margin-left: 4px;
      font-weight: 400;
    }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  @ViewChild(TaskListComponent)
  taskListComponent?: TaskListComponent;
  private shortcutListener: (event: KeyboardEvent) => void;

  constructor(private authService: AuthService, private ngZone: NgZone) {
    this.shortcutListener = (event: KeyboardEvent) =>
      this.ngZone.run(() => this.handleKeyboardShortcut(event));
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.shortcutListener, true);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.shortcutListener, true);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.shortcutListener, true);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.shortcutListener, true);
    }
  }

  canCreateTask(): boolean {
    return this.currentUser?.role === 'Owner' || this.currentUser?.role === 'Admin';
  }

  openCreateTask(): void {
    if (this.taskListComponent) {
      this.taskListComponent.openCreateModal();
    } else {
      // Fallback for safety
      window.dispatchEvent(new CustomEvent('createTask'));
    }
  }

  private handleKeyboardShortcut(event: KeyboardEvent): void {
    const key = event.key?.toLowerCase();
    if (!key) {
      return;
    }

    // Check if user is typing in an input/textarea (don't trigger shortcuts)
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Ctrl+S for saving forms
      if ((event.ctrlKey || event.metaKey) && key === 's') {
        event.preventDefault();
        event.stopPropagation();
        event.returnValue = false;
        const form = document.querySelector('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }
      }
      return;
    }

    // Ctrl/Cmd + N: Create new task
    if ((event.ctrlKey || event.metaKey) && key === 'n') {
      event.preventDefault();
      event.stopPropagation();
      event.returnValue = false;
      if (this.canCreateTask()) {
        this.openCreateTask();
      }
    }

    // Ctrl/Cmd + F: Focus search/filter input
    if ((event.ctrlKey || event.metaKey) && key === 'f') {
      event.preventDefault();
      event.stopPropagation();
      event.returnValue = false;
      const searchInput = document.querySelector('.filter-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Escape: Close modals
    if (event.key === 'Escape') {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        const closeButton = modal.querySelector('.close-btn') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  }
}

