import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiSettings } from '../models/api-settings';
import { ApiKey } from '../models/api-key';
import { ApiKeyCreated } from '../models/api-key-created';
import { ApiLogEntry } from '../models/api-log-entry';
import { LogService } from './log';

/**
 * REST client for the API management endpoints (settings, keys, session log).
 */
@Injectable({
  providedIn: 'root',
})
export class ApiManagementApi {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _log: LogService = inject(LogService);

  private readonly _baseUrl: string = 'http://localhost:7000/api';

  /**
   * Gets the current API settings from the backend.
   * @returns {Observable<ApiSettings>} An observable emitting the current {@link ApiSettings}.
   */
  getSettings(): Observable<ApiSettings> {
    this._log.debug('GET api-settings request started');

    return this._http.get<ApiSettings>(`${this._baseUrl}/api-settings`).pipe(
      tap((result) => this._log.info('GET api-settings successful', result)),
      catchError((err) => {
        this._log.error('GET api-settings failed', err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Updates the API settings via the backend.
   * @param {ApiSettings} settings The new {@link ApiSettings} to persist.
   * @returns {Observable<ApiSettings>} An observable emitting the updated {@link ApiSettings}.
   */
  updateSettings(settings: ApiSettings): Observable<ApiSettings> {
    this._log.debug('POST api-settings request started', settings);

    return this._http.post<ApiSettings>(`${this._baseUrl}/api-settings`, settings).pipe(
      tap((result) => this._log.info('POST api-settings successful', result)),
      catchError((err) => {
        this._log.error('POST api-settings failed', err, settings);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Gets all issued API keys (metadata only).
   * @returns {Observable<ApiKey[]>} An observable emitting the list of issued {@link ApiKey}s.
   */
  getKeys(): Observable<ApiKey[]> {
    this._log.debug('GET api-keys request started');

    return this._http.get<ApiKey[]>(`${this._baseUrl}/api-keys`).pipe(
      tap((result) => this._log.info('GET api-keys successful', { count: result.length })),
      catchError((err) => {
        this._log.error('GET api-keys failed', err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Creates a new API key. The response contains the plaintext key exactly once.
   * @param {string} name The human-readable name of the key (e.g. "Stream Deck").
   * @param {number} accessLevel The access level of the key (0 = read-only, 1 = read-write).
   * @returns {Observable<ApiKeyCreated>} An observable emitting the created {@link ApiKeyCreated}, including the plaintext key.
   */
  createKey(name: string, accessLevel: number): Observable<ApiKeyCreated> {
    this._log.debug('POST api-keys request started', { name, accessLevel });

    // The response carries the plaintext key (shown once in the UI). Do not log any field
    // derived from it, so the secret can never reach the console/log sink.
    return this._http.post<ApiKeyCreated>(`${this._baseUrl}/api-keys`, { name, accessLevel }).pipe(
      tap(() => this._log.info('POST api-keys successful')),
      catchError((err) => {
        this._log.error('POST api-keys failed', err, { name, accessLevel });
        return throwError(() => err);
      }),
    );
  }

  /**
   * Deletes (revokes) an API key by id.
   * @param {string} id The id of the key to delete.
   * @returns {Observable<void>} An observable that completes once the key has been deleted.
   */
  deleteKey(id: string): Observable<void> {
    this._log.debug('DELETE api-keys request started', { id });

    return this._http.delete<void>(`${this._baseUrl}/api-keys/${id}`).pipe(
      tap(() => this._log.info('DELETE api-keys successful', { id })),
      catchError((err) => {
        this._log.error('DELETE api-keys failed', err, { id });
        return throwError(() => err);
      }),
    );
  }

  /**
   * Gets the API request log of the current backend session.
   * @returns {Observable<ApiLogEntry[]>} An observable emitting the list of {@link ApiLogEntry}s, oldest first.
   */
  getLog(): Observable<ApiLogEntry[]> {
    this._log.debug('GET api-log request started');

    return this._http.get<ApiLogEntry[]>(`${this._baseUrl}/api-log`).pipe(
      tap((result) => this._log.info('GET api-log successful', { count: result.length })),
      catchError((err) => {
        this._log.error('GET api-log failed', err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Clears the API request log.
   * @returns {Observable<void>} An observable that completes once the log has been cleared.
   */
  clearLog(): Observable<void> {
    this._log.debug('DELETE api-log request started');

    return this._http.delete<void>(`${this._baseUrl}/api-log`).pipe(
      tap(() => this._log.info('DELETE api-log successful')),
      catchError((err) => {
        this._log.error('DELETE api-log failed', err);
        return throwError(() => err);
      }),
    );
  }
}
