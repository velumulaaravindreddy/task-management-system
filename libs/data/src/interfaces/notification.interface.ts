import { Role } from '../enums';

export interface Notification {
  id: string;
  message: string;
  roleVisibility: Role[];
  orgId?: string | null;
  createdAt: string;
  targetUserId?: string | null;
}

