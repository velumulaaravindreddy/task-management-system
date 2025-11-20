import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { AuthService, User as AppUser } from './auth.service';

export type NotificationRole = 'Owner' | 'Admin' | 'Viewer';

export interface Notification {
  id: string;
  message: string;
  roleVisibility: NotificationRole[];
  orgId?: string | null;
  createdAt: string;
  targetUserId?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000';
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private readIds = new Set<string>();
  private hasLoaded = false;

  constructor(private http: HttpClient, private authService: AuthService) {}

  loadNotifications(): void {
    if (this.hasLoaded) {
      return;
    }

    this.hasLoaded = true;
    this.http.get<Notification[]>(`${this.apiUrl}/notifications`).subscribe({
      next: (notifications) => this.notifications$.next(notifications),
      error: () => this.notifications$.next([]),
    });
  }

  getNotificationsForCurrentUser(): Observable<Notification[]> {
    return combineLatest([this.authService.currentUser$, this.notifications$]).pipe(
      map(([user, notifications]) => this.filterNotificationsForUser(notifications, user)),
    );
  }

  getUnreadCount(): Observable<number> {
    return this.getNotificationsForCurrentUser().pipe(
      map((notifications) => notifications.filter((n) => !this.readIds.has(n.id)).length),
    );
  }

  markAsRead(notificationId: string): void {
    this.readIds.add(notificationId);
    this.notifications$.next(this.notifications$.value.slice());
  }

  private filterNotificationsForUser(notifications: Notification[], user: AppUser | null): Notification[] {
    if (!user) {
      return [];
    }

    if (user.role === 'Owner') {
      return notifications.sort(this.sortByDateDesc);
    }

    if (user.role === 'Admin') {
      return notifications
        .filter(
          (notification) =>
            notification.roleVisibility.includes('Admin') &&
            (!notification.orgId || notification.orgId === user.organizationId),
        )
        .sort(this.sortByDateDesc);
    }

    return notifications
      .filter(
        (notification) =>
          notification.roleVisibility.includes('Viewer') && notification.targetUserId === user.id,
      )
      .sort(this.sortByDateDesc);
  }

  private sortByDateDesc(a: Notification, b: Notification): number {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
}

