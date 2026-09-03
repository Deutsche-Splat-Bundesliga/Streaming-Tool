import { Component, inject, OnDestroy, OnInit, WritableSignal, effect } from '@angular/core';
import { BroadcastState } from '../../models/broadcast-state';
import { BroadcastStateService } from '../../services/broadcast-state';
import { Signalr } from '../../services/signalr';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
import { FormsModule } from '@angular/forms';
import { Division } from '../../models/division';

@Component({
  selector: 'app-topbar',
  imports: [FormsModule],
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
   * Effect that logs SignalR connection state changes.
   */
  private _connectionEffect = effect(() => {
    const connected = this.isConnected();

    this._log.debug('SignalR connection state changed', {
      connected,
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
  }
}
