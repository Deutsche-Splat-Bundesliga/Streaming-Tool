import { Component, inject, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { Division } from '../../models/division';

@Component({
  selector: 'app-tourney-settings-dialog',
  imports: [MatDialogModule, FormsModule],
  templateUrl: './tourney-settings-dialog.html',
  styleUrl: './tourney-settings-dialog.scss',
})
export class TourneySettingsDialog {
  /**
   * Service that manages broadcast state and division data.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Writable signal representing the current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Available divisions for the broadcast state.
   */
  availableDivisions: Division[] = this.stateService.availableDivisions;
}
