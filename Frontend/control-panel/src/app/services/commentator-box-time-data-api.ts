import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { CommentatorBoxTimeData } from '../models/commentator-box-time-data';
import { LogService } from './log';

@Injectable({
  providedIn: 'root',
})
export class CommentatorBoxTimeDataApi {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _log: LogService = inject(LogService);

  private readonly _baseUrl: string = 'http://localhost:7000/api/commentator-box-time-data';

  /**
   * GET commentator box time data
   */
  getCommentatorBoxTimeData(): Observable<CommentatorBoxTimeData> {
    this._log.debug('GET commentator box time data request started');

    return this._http
      .get<CommentatorBoxTimeData>(`${this._baseUrl}/commentator-box-time-data`)
      .pipe(
        tap((result) => {
          this._log.info('GET commentator box time data successful', {
            hideDisplayIntervalInSeconds: result.hideDisplayIntervalInSeconds,
            showDisplayIntervalInSeconds: result.showDisplayIntervalInSeconds,
            displayMode: result.displayMode,
          });
        }),
        catchError((err) => {
          this._log.error('GET commentator box time data failed', err);

          return throwError(() => err);
        }),
      );
  }

  /**
   * POST commentator box time data
   */
  updateCommentatorBoxTimeData(
    timeData: CommentatorBoxTimeData,
  ): Observable<CommentatorBoxTimeData> {
    this._log.debug('POST commentator box time data request started', {
      hideDisplayIntervalInSeconds: timeData.hideDisplayIntervalInSeconds,
      showDisplayIntervalInSeconds: timeData.showDisplayIntervalInSeconds,
      displayMode: timeData.displayMode,
    });

    return this._http
      .post<CommentatorBoxTimeData>(`${this._baseUrl}/commentator-box-time-data`, timeData)
      .pipe(
        tap((result) => {
          this._log.info('POST commentator box time data successful', {
            hideDisplayIntervalInSeconds: result.hideDisplayIntervalInSeconds,
            showDisplayIntervalInSeconds: result.showDisplayIntervalInSeconds,
            displayMode: timeData.displayMode,
          });
        }),
        catchError((err) => {
          this._log.error('POST commentator box time data failed', err, timeData);

          return throwError(() => err);
        }),
      );
  }
}
