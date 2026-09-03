import { Component, inject, NgZone, OnDestroy, OnInit, WritableSignal } from '@angular/core';
import { CommentatorBox } from '../commentator-box/commentator-box';
import { BroadcastState } from '../../models/broadcast-state';
import { BroadcastStateService } from '../../services/broadcast-state';
import { NgClass } from '@angular/common';
import { TeamNameSwitchingService } from '../../services/team-name-switching';
import { ResizableText } from '../../features/resizable-text/resizable-text';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';

@Component({
  selector: 'app-map-screen-display',
  imports: [CommentatorBox, NgClass, ResizableText],
  templateUrl: './map-screen-display.html',
  styleUrl: './map-screen-display.scss',
})
export class MapScreenDisplay implements OnInit, OnDestroy {
  /**
   * Logger used for component diagnostics.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Scope for the MapScreen overlay.
   */
  private readonly _scope: LogScope = this._log.beginScope('MapScreen');

  /**
   * Broadcast state service instance.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Angular zone used for change detection.
   */
  ngZone: NgZone = inject(NgZone);

  /**
   * Current broadcast state signal.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Service for switching the team names around if `state().alphaIsLeft` changes from `true` to `false`, or vice versa
   */
  teamNameSwitchingService: TeamNameSwitchingService = inject(TeamNameSwitchingService);

  /**
   * Initializes the map screen display component by calling the `loadInitialState` method on the `BroadcastStateService`. This ensures that the component has the initial broadcast state loaded and ready to display when it is first rendered. The `ngOnInit` lifecycle hook is used to perform this initialization logic, which is a common practice in Angular components to set up necessary data or state before the component is displayed to the user.
   */
  ngOnInit(): void {
    const scope = this._log.beginScope('MapScreenDisplay.ngOnInit');

    this._log.trace('MapScreenDisplay initialized');

    try {
      this._log.debug('Loading broadcast state for map screen');

      this.stateService.loadInitialState();

      this._log.debug('Broadcast state load requested');
    } catch (err) {
      this._log.error('Failed during MapScreenDisplay initialization', err);
    } finally {
      scope.dispose();
    }
  }

  // TODO: Make this function into a seperate service once we introduce further branding options, and also add translation!
  /**
   * Gets the tournament info string in the overlay header depending on if the current format is a league or normal tournament setting
   * @returns {string} Tournament info (Bracket, Name, ...)
   */
  get tournamentInfo(): string {
    const info = this.state().isLeague
      ? `${this.state().tournamentName} Season ${this.state().season} - Woche ${this.state().week} - Division ${this.state().division}`
      : `${this.state().tournamentName} - ${this.state().bracketName}`;

    return info.replace(/- $/, '').trim();
  }

  /**
   * Gets the CSS class for the winning team logo.
   * @param winner {'alpha' | 'bravo'} - The winning team identifier.
   * @returns {string} The CSS class for the winning team's logo color.
   */
  setWinnerLogoColor(winner: 'alpha' | 'bravo'): string {
    const isAlphaLeft = this.state().alphaIsLeft;

    const result =
      (winner === 'alpha' && isAlphaLeft) || (winner === 'bravo' && !isAlphaLeft)
        ? 'team-alpha-color'
        : 'team-bravo-color';

    this._log.trace('Computed winner logo color', {
      winner,
      isAlphaLeft,
      result,
    });

    return result;
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('Map Screen destroyed');
    this._scope.dispose();
  }
}
