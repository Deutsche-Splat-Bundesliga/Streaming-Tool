import { Component, inject, OnDestroy, OnInit, WritableSignal } from '@angular/core';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { SocialsService } from '../../services/socials';
import { Socials } from '../../models/socials';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
@Component({
  selector: 'end-screen',
  imports: [],
  templateUrl: './end-screen.html',
  styleUrl: './end-screen.scss',
})
export class EndScreen implements OnInit, OnDestroy {
  /**
   * Logger service for debug and error logging.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Scope for the EndScreen overlay.
   */
  private readonly _scope: LogScope = this._log.beginScope('EndScreen');

  /**
   * Service managing broadcast state.
   */
  stateService = inject(BroadcastStateService);
  /**
   * Service managing socials data.
   */
  socialsService = inject(SocialsService);

  /**
   * Current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Current socials information.
   */
  socials: WritableSignal<Socials> = this.socialsService.socials;

  /**
   * Initializes the end screen component and loads initial state.
   */
  ngOnInit(): void {
    const scope = this._log.beginScope('EndScreen.ngOnInit');

    this._log.trace('EndScreen initialized');

    try {
      this._log.trace('Loading initial overlay state');

      this.stateService.loadInitialState();
      this.socialsService.loadInitialState();

      this._log.debug('Initial overlay state requested');
    } catch (err) {
      this._log.error('Failed during EndScreen initialization', err);
    } finally {
      scope.dispose();
    }
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('End Screen destroyed');
    this._scope.dispose();
  }
}
