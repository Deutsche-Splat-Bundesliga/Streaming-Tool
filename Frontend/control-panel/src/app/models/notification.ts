import { NotificationType } from '../enums/notification-type';

/**
 * Defines the `notification` interface, which represents a toast notification with it's notification type, the display duration, it's displayed text, it's id, and if it is being dismissed
 */
export interface Notification {
  id: string;
  type: NotificationType;
  text: string;
  duration: number;
  isDismissed: boolean;
}
