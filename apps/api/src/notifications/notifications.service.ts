import { Injectable } from '@nestjs/common';
import { Notification, Role } from '@task-management-system/data';

@Injectable()
export class NotificationsService {
  private readonly notifications: Notification[] = [
    {
      id: '1',
      message: 'Quarterly security review scheduled for next Monday.',
      roleVisibility: [Role.OWNER],
      orgId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '2',
      message: 'New admin added to Acme Subsidiary org.',
      roleVisibility: [Role.OWNER, Role.ADMIN],
      orgId: 'acme-subsidiary',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: '3',
      message: 'Task "Design onboarding flow" has been assigned to you.',
      roleVisibility: [Role.VIEWER],
      orgId: 'acme-subsidiary',
      targetUserId: 'viewer-1',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '4',
      message: 'System maintenance scheduled for this weekend.',
      roleVisibility: [Role.OWNER, Role.ADMIN, Role.VIEWER],
      orgId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  ];

  findForUser(user: { id: string; role: Role; organizationId?: string }): Notification[] {
    if (!user) {
      return [];
    }

    if (user.role === Role.OWNER) {
      return this.notifications;
    }

    if (user.role === Role.ADMIN) {
      return this.notifications.filter(
        (notification) =>
          notification.roleVisibility.includes(Role.ADMIN) &&
          (!notification.orgId || notification.orgId === user.organizationId),
      );
    }

    return this.notifications.filter(
      (notification) =>
        notification.roleVisibility.includes(Role.VIEWER) &&
        notification.targetUserId === user.id,
    );
  }
}

