import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { CommentatorBoxTimeDataApi } from './commentator-box-time-data-api';
import { Signalr } from './signalr';
import { CommentatorBoxTimeData } from '../models/commentator-box-time-data';
import { SignalrServiceConnection } from '../enums/SignalrServiceConnection';
import { LogService } from './log';
import { CommBoxDisplayMode } from '../enums/comm-box-display-modes';

@Injectable({
  providedIn: 'root',
})
export class CommentatorBoxTimeDataService {
  private readonly _api = inject(CommentatorBoxTimeDataApi);
  private readonly _signalr = inject(Signalr);
  private readonly _log = inject(LogService);

  /**
   * Main state signal
   */
  commentatorBoxTimeData: WritableSignal<CommentatorBoxTimeData> = signal<CommentatorBoxTimeData>({
    hideDisplayIntervalInSeconds: 50,
    showDisplayIntervalInSeconds: 5,
    displayMode: CommBoxDisplayMode.Manual,
  });

  /**
   * Initializes service + SignalR subscription
   */
  constructor() {
    const scope = this._log.beginScope('CommentatorBoxTimeDataService');

    this._log.info('Initializing CommentatorBoxTimeDataService');

    effect(() => {
      const incoming = this._signalr.liveCommentatorBoxTimeData();

      if (!incoming) return;

      this._log.debug('Received SignalR time data update', incoming);

      this.commentatorBoxTimeData.set(incoming);

      this._log.info('CommentatorBoxTimeData updated from SignalR');
    });

    this._signalr.connectionType = SignalrServiceConnection.CommentatorBoxTimeData;

    this._signalr.start();

    this._log.info('SignalR connection started for CommentatorBoxTimeData');

    scope.dispose();
  }

  /**
   * Updates time data (optimistic update + API sync)
   */
  update(partial: Partial<CommentatorBoxTimeData>): void {
    const scope = this._log.beginScope('CommentatorBoxTimeDataService.update');

    try {
      const before = this.commentatorBoxTimeData();

      const newTimeData = {
        ...before,
        ...partial,
      };

      this._log.debug('Updating commentator box time data', {
        before,
        patch: partial,
        after: newTimeData,
      });

      this.commentatorBoxTimeData.set(newTimeData);

      this._api.updateCommentatorBoxTimeData(newTimeData).subscribe({
        next: (result) => {
          this._log.info('Time data successfully updated via API', result);
        },
        error: (err) => {
          this._log.error('Failed to update time data', err, newTimeData);
        },
      });
    } finally {
      scope.dispose();
    }
  }

  /**
   * Loads initial state from backend
   */
  loadInitialState(): void {
    const scope = this._log.beginScope('CommentatorBoxTimeDataService.loadInitialState');

    this._log.info('Loading initial time data');

    this._api.getCommentatorBoxTimeData().subscribe({
      next: (timeData) => {
        this._log.debug('Initial time data received', timeData);

        this.commentatorBoxTimeData.set(timeData);

        this._log.info('Initial time data applied');
      },
      error: (err) => {
        this._log.error('Failed to load initial time data', err);
      },
    });

    scope.dispose();
  }
}
