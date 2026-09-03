import { Component, inject, WritableSignal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { NgStyle } from '@angular/common';
import { ToggleSlider } from '../../features/toggle-slider/toggle-slider';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-change-colors-dialog',
  imports: [MatDialogModule, NgStyle, ToggleSlider, TranslocoDirective],
  templateUrl: './change-colors-dialog.html',
  styleUrl: './change-colors-dialog.scss',
})
export class ChangeColorsDialog {
  /**
   * Service that manages broadcast state and division data.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Writable signal representing the current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;
}
