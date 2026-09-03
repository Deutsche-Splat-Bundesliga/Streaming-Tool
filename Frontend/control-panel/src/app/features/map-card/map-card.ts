import { NgClass } from '@angular/common';
import { Component, Input, WritableSignal, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditCard } from '../edit-card/edit-card';
import { BroadcastState } from '../../models/broadcast-state';
import { MapState } from '../../models/map-state';
import { Map } from '../../models/map';
import { Mode } from '../../models/mode';
import { BroadcastStateService } from '../../services/broadcast-state';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-map-card',
  imports: [FormsModule, EditCard, NgClass, TranslocoDirective],
  templateUrl: './map-card.html',
  styleUrl: './map-card.scss',
})
export class MapCard implements OnInit, OnDestroy {
  /**
   * The logging service.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Scoped logger lifecycle manager.
   */
  private readonly _scope: LogScope = this._log.beginScope('MapCard');

  /**
   * The map state bound to this component.
   */
  @Input({ required: true }) map!: MapState;

  /**
   * Service managing broadcast state updates.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Signal representing the current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Available maps signal from broadcast state that gets the translated and alphabetically sorted maps
   */
  availableMaps: WritableSignal<Map[]> = this.stateService.availableMaps;

  /**
   * Available modes for map selection.
   */
  availableModes: WritableSignal<Mode[]> = this.stateService.availableModes;

  /**
   * Whether the edit menu is visible.
   */
  showEditMenu: boolean = false;

  /**
   * Initialize the component and log startup details.
   */
  ngOnInit(): void {
    this._log.debug('MapCard initialized', {
      mapId: this.map?.id,
    });
  }

  /**
   * Get the CSS class for a team button based on the current winner.
   * @param team {'alpha' | 'beta'} Team identifier
   * @returns {string} CSS class string for the team button
   */
  getTeamButtonClass(team: 'alpha' | 'bravo'): string {
    const winner = this.state().maps.find((m) => m.id === this.map.id)?.winner ?? null;

    return winner === null
      ? `teamButton ${team}`
      : winner === team
        ? `teamButton ${team}-win`
        : 'teamButton';
  }

  /**
   * Handle a winner selection for this map card.
   * @param winner {'alpha' | 'bravo'} Selected winner
   */
  handleWinnerSelection(winner: 'alpha' | 'bravo'): void {
    const current = this.state().maps.find((m) => m.id === this.map.id)?.winner ?? null;

    if (current === winner) {
      this._log.info('Winner cleared', {
        mapId: this.map.id,
        previousWinner: winner,
      });

      return this.setWinner(null);
    }

    this._log.info('Winner selected', {
      mapId: this.map.id,
      winner,
    });

    this.setWinner(winner);
  }

  /**
   * Handle click event on counterpick button that marks a map as a counterpick by setting the `isVisible` boolean
   */
  handleCounterPickClick(): void {
    const newVisibleState = !this.map.isVisible;

    this._log.info('Updating isVisible', {
      mapId: this.map.id,
      previous: this.map.isVisible,
      new: newVisibleState,
    });

    const state = this.stateService.state();
    const updatedMaps = state.maps.map((m) => {
      if (m.id !== this.map.id) {
        return m;
      }

      return { ...m, isVisible: newVisibleState };
    });

    this.stateService.update({
      maps: updatedMaps,
    });
  }

  /**
   * Update the winner for the current map and refresh score totals.
   * @param winner {'alpha' | 'bravo' | null} Winner identifier or null to clear the selection
   */
  setWinner(winner: 'alpha' | 'bravo' | null): void {
    this._log.debug('Updating winner', {
      mapId: this.map.id,
      winner,
    });

    const state = this.stateService.state();

    const updatedMaps = state.maps.map((m) => {
      if (m.id !== this.map.id) {
        return m;
      }
      return { ...m, winner };
    });

    const scoreAlpha = updatedMaps.filter((x) => x.winner === 'alpha').length;
    const scoreBravo = updatedMaps.filter((x) => x.winner === 'bravo').length;

    this.stateService.update({
      maps: updatedMaps,
      scoreAlpha,
      scoreBravo,
    });
  }

  /**
   * Remove this map from the broadcast state.
   */
  removeMap(): void {
    this._log.warn('Map removed', {
      mapId: this.map.id,
    });

    this.stateService.removeMap(this.map.id);
  }

  /**
   * Update the current map selection using the provided map id.
   * @param mapId {string} Identifier of the selected map
   */
  updateMap(mapId: string): void {
    this._log.info('Map update requested', {
      mapId,
      currentMapId: this.map.id,
    });

    const selected = this.availableMaps().find((m) => m.id === mapId);

    if (!selected) {
      this._log.error('Selected map not found', {
        mapId,
      });
      return;
    }

    const updatedMaps = this.stateService.state().maps.map((m) => {
      if (m.id === this.map.id) {
        return {
          ...m,
          mapId,
        };
      }
      return m;
    });

    this.stateService.update({ maps: updatedMaps });
  }

  /**
   * Update the game mode for the current map.
   * @param modeId {string} Identifier of the selected mode
   */
  updateMode(modeId: string): void {
    this._log.info('Mode update requested', {
      modeId,
      mapId: this.map.id,
    });

    const selected = this.availableModes().find((m) => m.id === modeId);

    if (!selected) {
      this._log.error('Selected mode not found', {
        modeId,
      });
      return;
    }

    const updatedMaps = this.stateService.state().maps.map((m) => {
      if (m.id === this.map.id) {
        return {
          ...m,
          modeId: selected.id,
        };
      }
      return m;
    });

    this.stateService.update({ maps: updatedMaps });
  }

  /**
   * Open the edit menu for this map card.
   */
  openEditMenu(): void {
    this._log.debug('Edit menu opened', {
      mapId: this.map.id,
    });

    this.showEditMenu = true;
  }

  /**
   * Close the edit menu for this map card.
   */
  closeEditMenu(): void {
    this._log.debug('Edit menu closed', {
      mapId: this.map.id,
    });

    this.showEditMenu = false;
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('MapCard destroyed');
    this._scope.dispose();
  }
}
