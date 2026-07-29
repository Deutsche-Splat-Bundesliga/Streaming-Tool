import { Component, inject, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { CommentatorBoxTimeDataService } from '../../services/commentator-box-time-data';
import { CommentatorBoxTimeData } from '../../models/commentator-box-time-data';
import { CommBoxDisplayMode } from '../../enums/comm-box-display-modes';

@Component({
  selector: 'app-comm-box-settings-dialog',
  imports: [MatDialogModule, FormsModule],
  templateUrl: './comm-box-settings-dialog.html',
  styleUrl: './comm-box-settings-dialog.scss',
})
export class CommBoxSettingsDialog {
  /**
   * Service that manages commentator box time data.
   */
  commentatorBoxTimeDataService: CommentatorBoxTimeDataService = inject(
    CommentatorBoxTimeDataService,
  );

  /**
   * Writable signal representing the commentator box time data.
   */
  commentatorBoxTimeData: WritableSignal<CommentatorBoxTimeData> =
    this.commentatorBoxTimeDataService.commentatorBoxTimeData;

  /**
   * Getter that returns property of `CommBoxDisplayMode` type to access enum on HTML
   */
  get commBoxDisplayMode(): typeof CommBoxDisplayMode {
    return CommBoxDisplayMode;
  }
}
