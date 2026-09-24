import { Component, inject } from '@angular/core';
import { NotificationManager } from '../../services/notification-manager';
import { ToastNotification } from '../notification/notification';

@Component({
  imports: [ToastNotification],
  selector: 'app-notifications-container',
  styleUrl: './notifications-container.scss',
  templateUrl: './notifications-container.html',
})
export class NotificationsContainer {
  /**
   * Notification manager service that handles creation, deletion and displaying of notifications
   */
  notificationManager: NotificationManager = inject(NotificationManager);
}
