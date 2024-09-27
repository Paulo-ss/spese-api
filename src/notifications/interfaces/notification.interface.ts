import { NotificationType } from '../enums/notification-type.enum';

export interface INotification {
  id: number;
  title: string;
  content: string;
  referenceId: number;
  type: NotificationType;
  userId: number;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
