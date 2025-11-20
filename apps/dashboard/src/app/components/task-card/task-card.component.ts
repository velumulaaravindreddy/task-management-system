import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../services/task.service';
import { TaskStatus } from '../../../../../../libs/data/src/index-frontend';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css'],
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() draggable: boolean = true;
  @Input() canEdit: boolean = false;
  @Input() canDelete: boolean = false;
  @Output() onClick = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onDragStartEvent = new EventEmitter<Task>();
  @Output() onDragEndEvent = new EventEmitter<void>();

  TaskStatus = TaskStatus; // Expose enum to template

  onDragStart(event: DragEvent): void {
    if (!this.draggable) {
      event.preventDefault();
      return;
    }
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.task.id);
      event.dataTransfer.setData('application/json', JSON.stringify(this.task));
    }
    
    // Emit to parent for tracking
    this.onDragStartEvent.emit(this.task);
    
    // Visual feedback
    const card = (event.currentTarget as HTMLElement);
    card.classList.add('task-card-dragging');
    card.style.opacity = '0.5';
  }

  onDragEnd(event: DragEvent): void {
    // Emit to parent
    this.onDragEndEvent.emit();
    
    // Remove visual feedback
    const card = (event.currentTarget as HTMLElement);
    card.classList.remove('task-card-dragging');
    card.style.opacity = '1';
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

  getInitials(user: { firstName: string; lastName: string }): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  isOverdue(dueDate: string): boolean {
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < now;
  }
}

