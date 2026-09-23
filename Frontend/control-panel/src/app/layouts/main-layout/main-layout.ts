import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { BroadcastStateService } from '../../services/broadcast-state';
import { SocialsService } from '../../services/socials';
import { CommentatorBoxTimeDataService } from '../../services/commentator-box-time-data';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';

@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Topbar, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit, OnDestroy {
  /**
   * Logger instance for lifecycle and initialization events.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * The scope manager for this component.
   */
  private readonly _scope: LogScope = this._log.beginScope('MainLayout');

  /**
   * Broadcast state service used to initialize overlay state.
   */
  private readonly _stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Socials service used to initialize social overlay state.
   */
  private readonly _socialsService: SocialsService = inject(SocialsService);

  /**
   * Commentator box time data service used to initialize time overlay state.
   */
  private readonly _commentatorBoxTimeDataService: CommentatorBoxTimeDataService = inject(
    CommentatorBoxTimeDataService,
  );

  /**
   * Initialize the main layout and bootstrap required overlay services.
   * @returns void
   */
  ngOnInit(): void {
    const scope: LogScope = this._log.beginScope('MainLayout.ngOnInit');

    this._log.info('MainLayout initialized');

    try {
      this._log.debug('Starting overlay bootstrap sequence');

      this._log.trace('Loading BroadcastStateService');
      this._stateService.loadInitialState();

      this._log.trace('Loading SocialsService');
      this._socialsService.loadInitialState();

      this._log.trace('Loading CommentatorBoxTimeDataService');
      this._commentatorBoxTimeDataService.loadInitialState();

      this._log.info('All initial overlay states requested');
    } catch (err) {
      this._log.error('Failed during main layout initialization', err);
    } finally {
      scope.dispose();
    }
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('Main Layout destroyed.');
    this._scope.dispose();
  }
}
