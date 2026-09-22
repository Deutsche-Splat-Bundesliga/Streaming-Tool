import { afterNextRender, Component, Input, OnDestroy } from '@angular/core';
import { NotificationType } from '../../enums/notification-type';
import { NgClass } from '@angular/common';

@Component({
  imports: [NgClass],
  selector: 'app-notification',
  styleUrl: './notification.scss',
  templateUrl: './notification.html',
})
export class Notification implements OnDestroy {
  @Input({ required: true }) type: NotificationType = NotificationType.Info;

  @Input({ required: true }) text: string = '';

  @Input({ required: true }) duration: number = 5000;

  private _notificationTypeClasses: Map<NotificationType, string> = new Map([
    [NotificationType.Error, 'type--error'],
    [NotificationType.Warning, 'type--warning'],
    [NotificationType.Success, 'type--success'],
    [NotificationType.Info, 'type--info'],
  ]);

  private _onRenderEffect = afterNextRender(() => {
    /*const notificationTypeClass = this._notificationTypeClasses.get(this.type);
    if(!notificationTypeClass) {
      throw new Error('Invalid NotificationType supplied when trying to create new notification!');
    }*/

    console.log(this);
  });

  get notificationTypeClass(): string {
    const notificationTypeClass = this._notificationTypeClasses.get(this.type);
    if (!notificationTypeClass) {
      throw new Error('Invalid NotificationType supplied when trying to create new notification!');
    }

    return notificationTypeClass;
  }

  ngOnDestroy(): void {
    this._onRenderEffect.destroy();
  }
}
