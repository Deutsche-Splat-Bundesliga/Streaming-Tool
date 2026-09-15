import { Component, inject, OnDestroy, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { TranslocoDirective } from '@jsverse/transloco';
import { formatDate } from '@angular/common';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
import { Ajv } from 'ajv';

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
   * Schema that ajv uses to validate import of set data from json
   */
  private readonly _exportSchema = {
    type: 'object',
    properties: {
      tournamentName: { type: 'string' },
      bracketName: { type: 'string' },
      teamAlphaName: { type: 'string' },
      teamBravoName: { type: 'string' },
      division: { type: 'number' },
      week: { type: 'number' },
      season: { type: 'number' },
      isLeague: { type: 'boolean' },
      maps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            mapId: { type: 'string' },
            modeId: { type: 'string' },
            order: { type: 'number' },
            winner: { type: ['string', 'null'] },
            isVisible: { type: 'boolean' },
          },
          additionalProperties: false,
          get required() {
            return Object.keys(this.properties);
          },
        },
      },
    },
    additionalProperties: false,
    get required() {
      return Object.keys(this.properties);
    },
  };

  /**
   * Local logger instance for edit card operations.
   */
  private readonly _log: LogService = inject(LogService);

  /**
   * Logging scope for this component lifecycle and actions.
   */
  private readonly _scope: LogScope = this._log.beginScope('TourneySettingsDialog');

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
    const mapData = this.state().maps.map((map) => {
      return {
        ...map,
        winner: null,
      };
    });
    const setData = {
      tournamentName: this.state().tournamentName,
      bracketName: this.state().bracketName,
      teamAlphaName: this.state().teamAlphaName,
      teamBravoName: this.state().teamBravoName,
      division: this.state().division,
      week: this.state().week,
      season: this.state().season,
      isLeague: this.state().isLeague,
      maps: mapData,
    };
    const blob = new Blob([JSON.stringify(setData, null, 2)], { type: 'application/json' });
    const formattedDate = formatDate(new Date(), 'yyyyMMdd', 'en');
    const fileName = `set-data-${formattedDate}.json`;

    try {
      // We are reaching fast inverse square root levels of cursed with this one
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const saveFileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
      });
      const saveFileWriter =
        (await saveFileHandle.createWritable()) as FileSystemWritableFileStream;
      await saveFileWriter.write(blob);
      await saveFileWriter.close();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      this._log.error('An error occured during the import of the set data JSON file!', error);
    }
  }

  /**
   * Import set data from a JSON file that sits on the drive of the user
   */
  async importSetData(): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [setDataFile] = await (window as any).showOpenFilePicker({
        types: [
          {
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
        multiple: false,
      });

      const file = await setDataFile.getFile();
      const setData = JSON.parse(await file.text()) as BroadcastState;
      if (!this._ajv.validate(this._exportSchema, setData)) {
        throw new Error(this._ajv.errorsText());
      }

      const newMaps = setData.maps.map((map) => {
        map.winner = null;
        return map;
      });
      const newData: BroadcastState = {
        ...this.state(),
        ...setData,
        scoreAlpha: 0,
        scoreBravo: 0,
        maps: newMaps,
      };
      this.stateService.update(newData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      this._log.error('An error occured during the import of the set data JSON file!', error);
    }
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('TourneySettingsDialog destroyed');
    this._scope.dispose();
  }
}
