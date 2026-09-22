import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
} from '@angular/core';
import { NotificationType } from '../../enums/notification-type';
import { NgClass } from '@angular/common';
import { NotificationManager } from '../../services/notification-manager';

@Component({
  imports: [NgClass],
  selector: 'app-notification',
  styleUrl: './notification.scss',
  templateUrl: './notification.html',
})
export class Notification implements OnDestroy {
  constructor(private readonly _elemRef: ViewContainerRef) {}

  @Input({ required: true }) id: string = '';
  @Input({ required: true }) type: NotificationType = NotificationType.Info;
  @Input({ required: true }) text: string = '';
  @Input({ required: true }) duration: number = 5000;

  @ViewChild('ntfTimer') private _ntfTimerElem?: ElementRef;

  private readonly _notificationManager: NotificationManager = inject(NotificationManager);

  private _timerAnimation?: Animation;

  private readonly _slideInAnimKeyFrames: Keyframe[] = [
    { opacity: 0, right: 'calc((var(--notification-width) + 2rem) * -1)' },
    { opacity: 1, right: '0' },
  ];
  private readonly _slideInAnimOptions: KeyframeAnimationOptions = {
    easing: 'ease-out',
    fill: 'forwards',
    duration: 500,
  };

  private readonly _timerAnimKeyFrames: Keyframe[] = [{ width: '100%' }, { width: '0' }];

  private _notificationTypeClasses: Map<NotificationType, string> = new Map([
    [NotificationType.Error, 'type--error'],
    [NotificationType.Warning, 'type--warning'],
    [NotificationType.Success, 'type--success'],
    [NotificationType.Info, 'type--info'],
  ]);

  private _onRenderEffect = afterNextRender(() => {
    const hostElement = this._elemRef.element.nativeElement as HTMLElement;
    const animation = hostElement.animate(this._slideInAnimKeyFrames, this._slideInAnimOptions);

    animation.onfinish = () => {
      this.startTimer();
    };
  });

  get notificationTypeClass(): string {
    const notificationTypeClass = this._notificationTypeClasses.get(this.type);
    if (!notificationTypeClass) {
      throw new Error('Invalid NotificationType supplied when trying to create new notification!');
    }

    return notificationTypeClass;
  }

  private startTimer(): void {
    if (!this._ntfTimerElem) {
      return;
    }
    const timerElem = this._ntfTimerElem.nativeElement as HTMLElement;

    const timerAnimKeyframes: Keyframe[] = [{ width: '100%' }, { width: '0' }];
    const timerAnimOptions: KeyframeAnimationOptions = {
      duration: this.duration,
      easing: 'linear',
      fill: 'forwards',
    };

    const animation = timerElem.animate(timerAnimKeyframes, timerAnimOptions);
    animation.onfinish = () => {
      this.dismissNotification();
    };
  }

  private dismissNotification(): void {
    this._timerAnimation?.pause();

    const hostElement = this._elemRef.element.nativeElement as HTMLElement;
    const animation = hostElement.animate(
      this._slideInAnimKeyFrames.reverse(),
      this._slideInAnimOptions,
    );
    animation.onfinish = () => {
      this._notificationManager.deleteNotification(this.id);
    };
  }

  dismissBtnClick = (event: Event) => {
    const button = event.target as HTMLElement;
    button.toggleAttribute('disabled', true);
    this.dismissNotification();
  };

  ngOnDestroy(): void {
    this._onRenderEffect.destroy();
  }
}
