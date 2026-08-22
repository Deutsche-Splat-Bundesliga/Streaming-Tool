import { inject, Injectable, WritableSignal } from '@angular/core';
import { BroadcastStateService } from './broadcast-state';
import { BroadcastState } from '../models/broadcast-state';

@Injectable({
  providedIn: 'root',
})
export class TeamNameSwitchingService {
  /**
   * Injects the `BroadcastStateService` to access the current broadcast state and available maps, modes, and divisions. The `state` signal is used to reactively track changes to the broadcast state, allowing the score box component to update its UI accordingly whenever the state changes. This setup enables the score box to display the current team names and scores based on the latest broadcast state received from the service.
   */
  private _stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * A writable signal that holds the current broadcast state. It is initialized by referencing the `state` signal from the `BroadcastStateService`, allowing the score box component to reactively update its UI whenever the broadcast state changes. This signal is used to display the team names and scores in the score box, ensuring that it always reflects the most current state of the broadcast as provided by the service.
   */
  private _state: WritableSignal<BroadcastState> = this._stateService.state;

  /**
   * Computed property that returns the name of the team on the left side of the score box based on the current broadcast state. It checks the `alphaIsLeft` boolean in the state to determine which team is on the left and returns the appropriate team name accordingly. This allows the score box to dynamically display the correct team names based on the current configuration of the broadcast state.
   */
  get leftTeamName(): string {
    return this._state().alphaIsLeft ? this._state().teamAlphaName : this._state().teamBravoName;
  }

  /**
   * Computed property that returns the name of the team on the right side of the score box based on the current broadcast state. Similar to `leftTeamName`, it checks the `alphaIsLeft` boolean in the state to determine which team is on the right and returns the appropriate team name accordingly. This ensures that the score box accurately reflects the team names based on the current configuration of the broadcast state.
   */
  get rightTeamName(): string {
    return this._state().alphaIsLeft ? this._state().teamBravoName : this._state().teamAlphaName;
  }

  /**
   * Computed property that returns the score of the team on the left side of the score box based on the current broadcast state. It checks the `alphaIsLeft` boolean in the state to determine which team's score should be displayed on the left and returns the appropriate score accordingly. This allows the score box to dynamically display the correct scores based on the current configuration of the broadcast state.
   */
  get leftScore(): number {
    return this._state().alphaIsLeft ? this._state().scoreAlpha : this._state().scoreBravo;
  }

  /**
   * Computed property that returns the score of the team on the right side of the score box based on the current broadcast state. Similar to `leftScore`, it checks the `alphaIsLeft` boolean in the state to determine which team's score should be displayed on the right and returns the appropriate score accordingly. This ensures that the score box accurately reflects the scores based on the current configuration of the broadcast state.
   */
  get rightScore(): number {
    return this._state().alphaIsLeft ? this._state().scoreBravo : this._state().scoreAlpha;
  }
}
