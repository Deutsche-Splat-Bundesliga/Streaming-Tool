import { Component, inject, OnDestroy, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BroadcastStateService } from '../../services/broadcast-state';
import { BroadcastState } from '../../models/broadcast-state';
import { TranslocoDirective } from '@jsverse/transloco';
import { formatDate } from '@angular/common';
import { LogService } from '../../services/log';
import { LogScope } from '../../models/log-scope';
import { MapState } from '../../models/map-state';

@Component({
  selector: 'app-tourney-settings-dialog',
  imports: [MatDialogModule, FormsModule, TranslocoDirective],
  templateUrl: './tourney-settings-dialog.html',
  styleUrl: './tourney-settings-dialog.scss',
})
export class TourneySettingsDialog implements OnDestroy {
  /**
   * Object that holds schema and type definitions for basic json export.
   * Property `maps` gets validated seperately
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly _jsonSchema: any = {
    tournamentName: 'string',
    bracketName: 'string',
    teamAlpha: 'string',
    teamBravo: 'string',
    division: 'number',
    week: 'number',
    season: 'number',
    isLeague: 'boolean',
  };

  /**
   * Object that holds schema and type definitions for MapState json import.
   * Properties `mapId`, `modeId` and `winner` get validated seperately
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly _mapSchema: any = {
    id: 'string',
    order: 'number',
    isVisible: 'boolean',
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
      teamAlpha: this.state().teamAlphaName,
      teamBravo: this.state().teamBravoName,
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
      if (this.validateJsonData(setData)) {
        this.stateService.update(setData);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      this._log.error('An error occured during the import of the set data JSON file!', error);
    }
  }

  /**
   * Validates the imported json file and the types of it's properties
   * @param data {any} Imported data from json
   * @returns If json data is valid or invalid
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateJsonData(data: any): boolean {
    for (const objEntry of Object.entries(data)) {
      const [key, value] = objEntry;
      const valueType = typeof value;
      const expectedType = this._jsonSchema[key];
      if (key === 'maps') {
        if (!this.validateMapData(data.maps)) {
          return false;
        }
      } else {
        if (!expectedType) {
          this._log.warn(
            `JSONImport: Property '${key}' is not defined in JSON schema and will be ignored during import`,
          );
          continue;
        }

        if (expectedType !== valueType) {
          this._log.error(
            `JSONImport: Property '${key}' is of type '${valueType}', expected '${expectedType}'`,
          );
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validates the MapState[] data from json import
   * @param data {MapState[]} Map data from json import
   * @returns If map data is valid or invalid
   */
  private validateMapData(maps: MapState[]): boolean {
    if (!Array.isArray(maps)) {
      this._log.error(`JSONImport: Property 'maps' is not an array!`);
      return false;
    }

    for (const map of maps) {
      if (typeof map !== 'object') {
        this._log.error(
          `JSONImport: Non-object found in property 'maps'! All values in array must be an object!`,
        );
        return false;
      }

      for (const objEntry of Object.entries(map)) {
        const [key, value] = objEntry;
        const valueType = typeof value;
        const expectedType = this._mapSchema[key];
        switch (key) {
          case 'winner':
            {
              const allowedWinnerValues = [null, 'alpha', 'bravo'];
              if (!allowedWinnerValues.includes(value)) {
                this._log.error(
                  `JSONImport: Property 'winner' has value '${value}', expected 'alpha', 'bravo' or null!`,
                );
                return false;
              }
            }
            break;

          case 'mapId':
            {
              if (!this.stateService.availableMaps().find((map) => map.id === value)) {
                this._log.error(`JSONImport: Map ID '${value}' is invalid!`);
                return false;
              }
            }
            break;

          case 'modeId':
            {
              if (!this.stateService.availableModes().find((mode) => mode.id === value)) {
                this._log.error(`JSONImport: Mode ID '${value}' is invalid!`);
                return false;
              }
            }
            break;

          default:
            {
              if (!expectedType) {
                this._log.warn(
                  `JSONImport: Property '${key}' is not defined in JSON schema and will be ignored during import`,
                );
                continue;
              }

              if (expectedType !== valueType) {
                this._log.error(
                  `JSONImport: Property '${key}' is of type '${valueType}', expected '${expectedType}'`,
                );
                return false;
              }
            }
            break;
        }
      }
    }

    return true;
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._log.trace('TourneySettingsDialog destroyed');
    this._scope.dispose();
  }
}
