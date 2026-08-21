import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { BroadcastState } from '../../models/broadcast-state';
import { BroadcastStateService } from '../../services/broadcast-state';
import { CommentatorBox } from '../commentator-box/commentator-box';
import { TeamNameSwitchingService } from '../../services/team-name-switching';
import { ResizableText } from '../../features/resizable-text/resizable-text';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';

@Component({
  selector: 'app-score-box',
  imports: [CommentatorBox, ResizableText],
  templateUrl: './score-box.html',
  styleUrl: './score-box.scss',
})
export class ScoreBox implements OnInit {
  /**
   * Logger used to trace score box lifecycle events.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Scope for the ScopeBox overlay.
   */
  private readonly _scope: LogScope = this._log.beginScope('ScoreBox');

  /**
   * Service that exposes the current broadcast state.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Writable signal containing the current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Service for switching the team names around if `state().alphaIsLeft` changes from `true` to `false`, or vice versa
   */
  teamNameSwitchingService: TeamNameSwitchingService = inject(TeamNameSwitchingService);

  /**
   * Initializes the score box component by calling the `loadInitialState` method on the `BroadcastStateService`. This ensures that the component has the initial broadcast state loaded and ready to display when it is first rendered. The `ngOnInit` lifecycle hook is used to perform this initialization logic, which is a common practice in Angular components to set up necessary data or state before the component is displayed to the user.
   */
  ngOnInit(): void {
    const scope = this._log.beginScope('ScoreBox.ngOnInit');

    this._log.info('ScoreBox initialized');

    try {
      this._log.trace('Requesting broadcast state load');

      this.stateService.loadInitialState();

      this._log.debug('Broadcast state load requested');
    } catch (err) {
      this._log.error('Failed during ScoreBox initialization', err);
    } finally {
      scope.dispose();
    }
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('Score Box destroyed');
    this._scope.dispose();
  }
}
