import { inject, Injectable, OnDestroy, signal, untracked, WritableSignal } from '@angular/core';
import { Notification } from '../models/notification';
import { LogService } from './log';
import { LogScope } from '../models/log-scope';
import { NotificationType } from '../enums/notification-type';

@Injectable({
  providedIn: 'root',
})
export class NotificationManager implements OnDestroy {
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
   * Creates a temporary notification with a unique id, type, text and a duration for when it should disappear
   * @param type Type of the notification
   * @param text Text that should be translated with Transloco
   * @param duration Duration of how long the notification should be displayed in milliseconds
   */
  createTempNotification(type: NotificationType, text: string, duration: number = 5000): void {
    if (duration <= 0) {
      this._log.error(
        "Unable to create a permanent notification with temp notification function! Use 'createPermanentNotification' instead!",
      );
      return;
    }

    const ntfId = 'ntf-' + Math.random().toString(36).slice(2);
    const newNotification: Notification = {
      id: ntfId,
      type,
      text,
      duration,
      isDismissed: false,
    };

    this._log.trace('Created new temporary notification', newNotification);

    const notifications = [...untracked(this.notifications), newNotification];
    this.notifications.set(notifications);
  }

  /**
   * Creates a permanent notification with a id, type and text
   * @param id Id of the notification. MUST be unique
   * @param type Type of the notification
   * @param text Text that should be translated with Transloco
   */
  createPermanentNotification(id: string, type: NotificationType, text: string) {
    const notifications = untracked(this.notifications);
    if (notifications.find((ntf) => ntf.id === id)) {
      this._log.error(
        `Unable to create notification! Notification with id '${id}' already exists!`,
      );
      return;
    }

    const newNotification: Notification = {
      id,
      type,
      text,
      duration: 0,
      isDismissed: false,
    };

    this._log.trace('Created new permanent notification', newNotification);

    const newNotifications = [...notifications, newNotification];
    this.notifications.set(newNotifications);
  }

  /**
   * Dismiss notification and update it's component to trigger slide out animation
   * @param id Id of notification to be dismissed
   */
  dismissNotification(id: string) {
    // Create completely new array instead of referencing signal so signal notifies it's listeners when updating
    const notifications = [...untracked(this.notifications)];
    const itemIndex = notifications.findIndex((ntf) => ntf.id === id);
    if (itemIndex === -1) {
      this._log.warn(`Unable to find notification with id '${id}'`);
      return;
    }

    if (notifications[itemIndex].isDismissed) {
      this._log.warn(`Notification '${id}' is already being dismissed`);
      return;
    }

    notifications[itemIndex].isDismissed = true;
    this._log.trace('Dismissed a notification', notifications[itemIndex]);
    this.notifications.set(notifications);
  }

  /**
   * Delete a notification with a unique id
   * @param id Id of the notification to be deleted
   */
  deleteNotification(id: string): void {
    const notifications = [...untracked(this.notifications)];
    const toBeDeletedNotification = notifications.find((ntf) => ntf.id === id);
    if (!toBeDeletedNotification) {
      this._log.warn(`Unable to find notification with id '${id}'`);
      return;
    }

    const newNotifications = notifications.filter((ntf) => ntf.id !== id);
    this._log.trace('Deleted a notification', toBeDeletedNotification);
    this.notifications.set(newNotifications);
  }

  /**
   * Dispose of all notifications in service
   */
  dispose(): void {
    this._log.trace('Disposing of all notifications');
    this.notifications.set([]);
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.dispose();
    this._scope.dispose();
  }
}
