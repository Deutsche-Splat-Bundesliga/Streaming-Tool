import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
  WritableSignal,
  signal,
  AfterRenderRef,
} from '@angular/core';
import { NotificationType } from '../../enums/notification-type';
import { NgClass } from '@angular/common';
import { NotificationManager } from '../../services/notification-manager';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  imports: [NgClass, TranslocoDirective],
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

  notificationText: WritableSignal<string> = signal<string>('');

  private readonly _notificationManager: NotificationManager = inject(NotificationManager);

  private _timerAnimation?: Animation;

  private readonly _slideInAnimKeyFrames: Keyframe[] = [
    { opacity: 0, right: 'calc((var(--notification-width) + 2rem) * -1)' },
    { opacity: 1, right: '0' },
  ];

  private _notificationTypeClasses: Map<NotificationType, string> = new Map([
    [NotificationType.Error, 'type--error'],
    [NotificationType.Warning, 'type--warning'],
    [NotificationType.Success, 'type--success'],
    [NotificationType.Info, 'type--info'],
  ]);

  private _onRenderEffect: AfterRenderRef = afterNextRender(() => {
    const hostElement = this._elemRef.element.nativeElement as HTMLElement;
    const slideInAnimOptions: KeyframeAnimationOptions = {
      easing: 'ease-out',
      fill: 'forwards',
      duration: 500,
    };
    const animation = hostElement.animate(this._slideInAnimKeyFrames, slideInAnimOptions);

    if (this.duration <= 0) {
      if (!this._ntfTimerElem) {
        return;
      }
      const timerElem = this._ntfTimerElem.nativeElement as HTMLElement;
      timerElem.classList.add('hidden');
      return;
    }

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

    this._timerAnimation = timerElem.animate(timerAnimKeyframes, timerAnimOptions);
    this._timerAnimation.onfinish = () => {
      this.dismissNotification();
    };
  }

  private dismissNotification(): void {
    this._timerAnimation?.pause();

    const hostElement = this._elemRef.element.nativeElement as HTMLElement;
    const slideOutAnimOptions: KeyframeAnimationOptions = {
      easing: 'ease-in',
      fill: 'forwards',
      duration: 500,
    };
    const animation = hostElement.animate(
      this._slideInAnimKeyFrames.reverse(),
      slideOutAnimOptions,
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
