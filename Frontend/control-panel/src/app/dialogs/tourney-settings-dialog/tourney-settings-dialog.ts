import { Component, inject, OnDestroy, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
import { Ajv } from 'ajv';
import { MapState } from '../../models/map-state';
import { SetDataExportSchema } from '../../types/ajv-schemas/set-data-import-export';

@Component({
  selector: 'app-tourney-settings-dialog',
  imports: [MatDialogModule, FormsModule, TranslocoDirective],
  templateUrl: './tourney-settings-dialog.html',
  styleUrl: './tourney-settings-dialog.scss',
})
export class TourneySettingsDialog implements OnDestroy {
  /**
   * ajv instance that is used for verifying json structure and it's types
   */
  private readonly _ajv = new Ajv();

  /**
   * Transloco service that handles translation settings
   */
  private _translocoService: TranslocoService = inject(TranslocoService);

  /**
   * Local logger instance for edit card operations.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Logging scope for this component lifecycle and actions.
   */
  private readonly _scope: LogScope = this._log.beginScope('TourneySettingsDialog');

  private _notificationTimeout: ReturnType<typeof setTimeout> | undefined;

  /**
   * Service that manages broadcast state and division data.
   */
  stateService: BroadcastStateService = inject(BroadcastStateService);

  /**
   * Writable signal representing the current broadcast state.
   */
  state: WritableSignal<BroadcastState> = this.stateService.state;

  /**
   * Export set data in JSON format, and download it to the drive of the user as a JSON file
   */
  async exportSetData(): Promise<void> {
    const currentState = this.state();
    const setData: Partial<BroadcastState> = {
      tournamentName: currentState.tournamentName,
      bracketName: currentState.bracketName,
      teamAlphaName: currentState.teamAlphaName,
      teamBravoName: currentState.teamBravoName,
      division: currentState.division,
      week: currentState.week,
      season: currentState.season,
      isLeague: currentState.isLeague,
      maps: this.resetMapWinners(currentState),
    };
    const setDataBlob = new Blob([JSON.stringify(setData, null, 2)], { type: 'application/json' });
    const blobUrl = window.URL.createObjectURL(setDataBlob);

    this._log.trace('Exporting set data as json to drive', setData);

    const tempAnchor = document.createElement('a');
    tempAnchor.style.display = 'none';
    tempAnchor.download = 'dsb-tool-set-data.json';
    tempAnchor.href = blobUrl;

    document.body.appendChild(tempAnchor);
    tempAnchor.click();
    window.URL.revokeObjectURL(blobUrl);
    tempAnchor.remove();

    this.showNotification(
      this._translocoService.translate('text.set-data-export-successful'),
      'success',
    );
  }

  /**
   * Import set data from a JSON file that sits on the drive of the user
   * @param e {Event} `change` event from file input when a file is uploaded
   */
  async importSetData(e: Event): Promise<void> {
    const fileInput = e.target as HTMLInputElement;
    if (!fileInput.files?.length) {
      this.showNotification(
        this._translocoService.translate('text.set-data-import-error'),
        'error',
      );
      this._log.error('ImportSetData: No files were uploaded!');
      return;
    }

    const file = fileInput.files[0];

    try {
      const setData = JSON.parse(await file.text()) as BroadcastState;
      if (!this._ajv.validate(SetDataExportSchema, setData)) {
        this.showNotification(
          this._translocoService.translate('text.set-data-import-error'),
          'error',
        );
        this._log.error(`ImportSetData: Validation of data failed!`, this._ajv.errorsText());
        return;
      }

      this._log.trace(
        'Successfully imported set data json file, writing to BroadcastState',
        setData,
      );

      const newData: BroadcastState = {
        ...this.state(),
        ...setData,
        scoreAlpha: 0,
        scoreBravo: 0,
        maps: this.resetMapWinners(setData),
      };
      this.stateService.update(newData);

      this.showNotification(
        this._translocoService.translate('text.set-data-import-successful'),
        'success',
      );
    } catch (error) {
      this._log.error('Error during import of set data json file!', error);

      this.showNotification(
        this._translocoService.translate('text.set-data-import-error'),
        'error',
      );
    }
  }

  /**
   * Sets all `winner` properties in `BroadcastState.maps` to `null` during export and import of JSON file
   * @param state {BroadcastState} Current `BroadcastState` during export, or `BroadcastState` with infos from JSON during import
   * @returns `MapState[]` with all `winner` properties set to `null`
   */
  private resetMapWinners(state: BroadcastState): MapState[] {
    return state.maps.map((map) => {
      return {
        ...map,
        winner: null,
      };
    });
  }

  private showNotification(text: string, type: string, duration: number = 5000): void {
    const notification = document.body.querySelector('.import-export-notification');
    if (!notification) {
      this._log.error(
        "ShowNotification: Unable to find notification element with class 'import-export-notification'",
      );
      return;
    }

    this._log.trace('Showing notification for import/export data', {
      duration,
      type,
      text,
    });
    clearTimeout(this._notificationTimeout);

    notification.textContent = text;
    notification.classList.remove('hidden');
    switch (type) {
      case 'success':
        {
          notification.classList.add('success');
          notification.classList.remove('error');
        }
        break;

      default:
        {
          notification.classList.remove('success');
          notification.classList.add('error');
        }
        break;
    }

    this._notificationTimeout = setTimeout(() => {
      notification.classList.add('hidden');
    }, duration);
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('TourneySettingsDialog destroyed');
    this._scope.dispose();
    clearTimeout(this._notificationTimeout);
  }
}
