import { inject, Injectable } from '@angular/core';
import { Notification } from '../models/notification';
import { LogService } from './log';
import { LogScope } from '../models/log-scope';
import { NotificationType } from '../enums/notification-type';

@Injectable({
  providedIn: 'root',
})
export class NotificationManager {
  /**
   * Local logger instance for edit card operations.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Logging scope for this component lifecycle and actions.
   */
  private readonly _scope: LogScope = this._log.beginScope('NotificationManager');

  /**
   * All currently active notifications that should be displayed
   */
  notifications: Notification[] = [
    { id: 'test-1', type: NotificationType.Info, text: 'Test 1', duration: 5000 },
    { id: 'test-2', type: NotificationType.Success, text: 'Test 2', duration: 5000 },
    { id: 'test-3', type: NotificationType.Warning, text: 'Test 3', duration: 5000 },
    { id: 'test-4', type: NotificationType.Error, text: 'Test 4', duration: 5000 },
  ];

  /**
   * Create a notification with a unique id, type, text and a duration for when it should disappear
   * @param id Id of the notification that gets created. MUST be unique
   * @param type Type of the notification
   * @param text Text that should be translated with Transloco
   * @param duration Duration of how long the notification should be displayed
   */
  createNotification(
    id: string,
    type: NotificationType,
    text: string,
    duration: number = 5000,
  ): void {
    if (this.notifications.find((ntf) => ntf.id === id)) {
      this._log.error(`Unable to create notification with id '${id}', already exists!`);
      return;
    }

    const newNotification: Notification = {
      id,
      type,
      text,
      duration,
    };

    this.notifications.push(newNotification);
  }

  /**
   * Delete a notification with a unique id
   * @param id Id of the notification to be deleted
   */
  deleteNotification(id: string): void {
    if (!this.notifications.find((ntf) => ntf.id === id)) {
      this._log.warn(`Unable to find notification with id '${id}'`);
      return;
    }

    this.notifications = this.notifications.filter((ntf) => ntf.id !== id);
  }

  /**
   * Dispose of all notifications in service
   */
  dispose(): void {
    this.notifications = [];
  }
}
