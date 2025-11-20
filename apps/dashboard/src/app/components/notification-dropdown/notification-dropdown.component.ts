import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from '../../services/notification.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css'],
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  currentUser: User | null = null;

  private subs = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.notificationService.loadNotifications();

    this.subs.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
      }),
    );

    this.subs.add(
      this.notificationService.getNotificationsForCurrentUser().subscribe((notifications) => {
        this.notifications = notifications;
      }),
    );

    this.subs.add(
      this.notificationService.getUnreadCount().subscribe((count) => {
        this.unreadCount = count;
      }),
    );
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
  }

  trackById(_index: number, notification: Notification): string {
    return notification.id;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

