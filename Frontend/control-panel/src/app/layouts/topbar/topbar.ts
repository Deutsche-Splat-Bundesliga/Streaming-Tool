import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  WritableSignal,
  afterNextRender,
  AfterRenderRef,
  afterRenderEffect,
  untracked,
} from '@angular/core';
import { BroadcastState } from '../../models/broadcast-state';
import { BroadcastStateService } from '../../services/broadcast-state';
import { Signalr } from '../../services/signalr';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
import { FormsModule } from '@angular/forms';
import { Division } from '../../models/division';
import { TranslocoDirective } from '@jsverse/transloco';
import { NotificationManager } from '../../services/notification-manager';
import { NotificationType } from '../../enums/notification-type';

@Component({
  selector: 'app-topbar',
  imports: [FormsModule, TranslocoDirective],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit, OnDestroy {
  /**
   * Logger instance for topbar events.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Logging scope created for the topbar component.
   */
  private readonly _scope: LogScope = this._log.beginScope('Topbar');

  /**
   * Notification manager service that handles creation, deletion and displaying of notifications
   */
  private _notificationManager: NotificationManager = inject(NotificationManager);

  /**
   * Effect that logs SignalR connection state changes.
   */
  private _connectionEffect = afterRenderEffect(() => {
    if (!this._isInitialized) {
      return;
    }

    const connected = this.isConnected();
    this._log.debug('SignalR connection state changed', {
      connected,
    });

    untracked(() => {
      if (!connected) {
        this._notificationManager.createPermanentNotification(
          'ntf-backend-not-connected',
          NotificationType.Error,
          'notification.no-backend-connection',
        );
      } else {
        this._notificationManager.dismissNotification('ntf-backend-not-connected');
        this._notificationManager.createTempNotification(NotificationType.Success, 'Test');
      }
    });
  });

  /**
   * Service that manages broadcast state and division data.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Broadcast state signal shared across the application.
   */
  state: WritableSignal<BroadcastState> = inject(BroadcastStateService).state;

  /**
   * SignalR connection state signal.
   */
  isConnected: WritableSignal<boolean> = inject(Signalr).isConnected;

  /**
   * Available divisions for the broadcast state.
   */
  availableDivisions: Division[] = this.stateService.availableDivisions;

  /**
   * Set initialized status of topbar to `true` 1500ms after render. This prevents the Backend not connected error message from showing during initialization of component
   */
  private _isInitialized: boolean = false;
  private _initalizeTopbar: AfterRenderRef = afterNextRender(() => {
    setTimeout(() => {
      this._isInitialized = true;

      if (!this.isConnected()) {
        this._notificationManager.createPermanentNotification(
          'ntf-backend-not-connected',
          NotificationType.Error,
          'notification.no-backend-connection',
        );
      }
    }, 1500);
  });

  /**
   * Angular lifecycle hook called after component initialization.
   * @returns {void}
   */
  ngOnInit(): void {
    this._log.info('Topbar initialized');

    this._log.debug('Initial state snapshot', {
      teamAlpha: this.state().teamAlphaName,
      teamBravo: this.state().teamBravoName,
      connected: this.isConnected(),
    });
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   * @returns {void}
   */
  ngOnDestroy(): void {
    this._log.trace('Topbar destroyed');

    this._connectionEffect.destroy();
    this._scope.dispose();
    this._initalizeTopbar.destroy();
  }
}
