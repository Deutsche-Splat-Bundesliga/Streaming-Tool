import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { BroadcastState } from '../models/broadcast-state';
import { LogService } from './log';

@Injectable({
  providedIn: 'root',
})
export class BroadcastApi {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _log: LogService = inject(LogService);

  private readonly _baseUrl: string = 'http://localhost:7000/api/broadcast';

  /**
   * GET broadcast state
   */
  getState(): Observable<BroadcastState> {
    this._log.debug('GET broadcast state request started');

    return this._http.get<BroadcastState>(`${this._baseUrl}/state`).pipe(
      tap((state) => {
        this._log.info('GET broadcast state successful', {
          teamAlphaName: state.teamAlphaName,
          teamBravoName: state.teamBravoName,
          scoreAlpha: state.scoreAlpha,
          scoreBravo: state.scoreBravo,
          mapCount: state.maps?.length ?? 0,
        });
      }),
      catchError((err) => {
        this._log.error('GET broadcast state failed', err);

        return throwError(() => err);
      }),
    );
  }

  /**
   * POST broadcast state
   */
  updateState(state: BroadcastState): Observable<BroadcastState> {
    this._log.debug('POST broadcast state request started', {
      teamAlphaName: state.teamAlphaName,
      teamBravoName: state.teamBravoName,
      scoreAlpha: state.scoreAlpha,
      scoreBravo: state.scoreBravo,
      mapCount: state.maps?.length ?? 0,
    });

    return this._http.post<BroadcastState>(`${this._baseUrl}/state`, state).pipe(
      tap((updated) => {
        this._log.info('POST broadcast state successful', {
          scoreAlpha: updated.scoreAlpha,
          scoreBravo: updated.scoreBravo,
          mapCount: updated.maps?.length ?? 0,
        });
      }),
      catchError((err) => {
        this._log.error('POST broadcast state failed', err, {
          attemptedState: state,
        });

        return throwError(() => err);
      }),
    );
  }
}
