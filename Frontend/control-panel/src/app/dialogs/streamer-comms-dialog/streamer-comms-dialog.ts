import { Component, inject, WritableSignal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-streamer-comms-dialog',
  imports: [MatDialogModule, FormsModule],
  templateUrl: './streamer-comms-dialog.html',
  styleUrl: './streamer-comms-dialog.scss',
})
export class StreamerCommsDialog {
  /**
   * Service that manages broadcast state and division data.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Writable signal representing the current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;
}
