import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
  AfterRenderRef,
  input,
  afterRenderEffect,
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
  /**
   * Get host element from constructor so we can modify it with classes at runtime
   */
  constructor(private readonly _elemRef: ViewContainerRef) {}

  /**
   * Inputs that hold our data for the notification
   */
  @Input({ required: true }) id: string = '';
  @Input({ required: true }) type: NotificationType = NotificationType.Info;
  @Input({ required: true }) text: string = '';
  @Input({ required: true }) duration: number = 5000;
  isDismissed = input<boolean>(false);

  /**
   * Reference to timer element so we can set it's animation or hide it
   */
  @ViewChild('ntfTimer') private _ntfTimerElem?: ElementRef;

  /**
   * Notification manager service that handles creation, deletion and displaying of notifications
   */
  private readonly _notificationManager: NotificationManager = inject(NotificationManager);

  /**
   * Timer animation reference, used for pausing animation when dismissing notification via dismiss button
   */
  private _timerAnimation?: Animation;

  /**
   * Keyframes for sliding in animation of notification
   */
  private readonly _slideInAnimKeyFrames: Keyframe[] = [
    { opacity: 0, right: 'calc((var(--notification-width) + 2rem) * -1)' },
    { opacity: 1, right: '0' },
  ];

  /**
   * Mapping of `NotificationType` enum to html class
   */
  private _notificationTypeClasses: Map<NotificationType, string> = new Map([
    [NotificationType.Error, 'type--error'],
    [NotificationType.Warning, 'type--warning'],
    [NotificationType.Success, 'type--success'],
    [NotificationType.Info, 'type--info'],
  ]);

  /**
   * Trigger sliding out of notification when it is dismissed by the handler
   */
  private _isDismissedEffect: AfterRenderRef = afterRenderEffect(() => {
    if (!this.isDismissed()) {
      return;
    }

    this.slideOutNotification();
  });

  /**
   * Effect that animates our element depending on the duration when it gets rendered for the first time
   */
  private _onRenderEffect: AfterRenderRef = afterNextRender(() => {
    const hostElement = this._elemRef.element.nativeElement as HTMLElement;
    const slideInAnimOptions: KeyframeAnimationOptions = {
      easing: 'ease-out',
      fill: 'forwards',
      duration: 500,
    };
    const animation = hostElement.animate(this._slideInAnimKeyFrames, slideInAnimOptions);

    if (this.duration <= 0) {
      return;
    }

    animation.onfinish = () => {
      this.startTimer();
    };
  });

  /**
   * Get correct html class for our notification depending on `this.type`
   */
  get notificationTypeClass(): string {
    const notificationTypeClass = this._notificationTypeClasses.get(this.type);
    if (!notificationTypeClass) {
      throw new Error('Invalid NotificationType supplied when trying to create new notification!');
    }

    return notificationTypeClass;
  }

  /**
   * Start notification timer animation when slide in animation finished
   */
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
      this._notificationManager.dismissNotification(this.id);
    };
  }

  /**
   * Start slide out animation after notification is dismissed, and delete it from manager once finished
   */
  private slideOutNotification(): void {
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

  /**
   * Dismiss notification in manager when dismiss button is clicked
   * @param event Button click event
   */
  dismissBtnClick = (event: Event) => {
    const button = event.target as HTMLElement;
    button.toggleAttribute('disabled', true);
    this._notificationManager.dismissNotification(this.id);
  };

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._onRenderEffect.destroy();
    this._isDismissedEffect.destroy();
  }
}
