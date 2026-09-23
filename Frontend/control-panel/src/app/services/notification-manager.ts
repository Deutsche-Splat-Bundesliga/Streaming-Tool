import { inject, Injectable, signal, WritableSignal } from '@angular/core';
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
  notifications: WritableSignal<Notification[]> = signal<Notification[]>([]);

  /**
   * Create a notification with a unique id, type, text and a duration for when it should disappear
   * @param id Id of the notification that gets created. MUST be unique
   * @param type Type of the notification
   * @param text Text that should be translated with Transloco
   * @param duration Duration of how long the notification should be displayed in milliseconds
   */
  createNotification(
    id: string,
    type: NotificationType,
    text: string,
    duration: number = 5000,
  ): void {
    /*if (this.notifications().find((ntf) => ntf.id === id)) {
      this._log.error(`Unable to create notification with id '${id}', already exists!`);
      return;
    }*/

    const newNotification: Notification = {
      id,
      type,
      text,
      duration,
    };

    const notifications = [...this.notifications(), newNotification];
    this.notifications.set(notifications);
  }

  /**
   * Delete a notification with a unique id
   * @param id Id of the notification to be deleted
   */
  deleteNotification(id: string): void {
    if (!this.notifications().find((ntf) => ntf.id === id)) {
      this._log.warn(`Unable to find notification with id '${id}'`);
      return;
    }

    const notifications = this.notifications().filter((ntf) => ntf.id !== id);
    this.notifications.set(notifications);
  }

  /**
   * Dispose of all notifications in service
   */
  dispose(): void {
    this.notifications.set([]);
  }
}
