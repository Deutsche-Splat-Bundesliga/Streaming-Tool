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
  private readonly http: HttpClient = inject(HttpClient);
  private readonly log: LogService = inject(LogService);

  private readonly baseUrl: string = 'http://localhost:7000/api';

  /**
   * Gets the current API settings from the backend.
   */
  getSettings(): Observable<ApiSettings> {
    this.log.debug('GET api-settings request started');

    return this.http.get<ApiSettings>(`${this.baseUrl}/api-settings`).pipe(
      tap((result) => this.log.info('GET api-settings successful', result)),
      catchError((err) => {
        this.log.error('GET api-settings failed', err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Updates the API settings via the backend.
   */
  updateSettings(settings: ApiSettings): Observable<ApiSettings> {
    this.log.debug('POST api-settings request started', settings);

    return this.http.post<ApiSettings>(`${this.baseUrl}/api-settings`, settings).pipe(
      tap((result) => this.log.info('POST api-settings successful', result)),
      catchError((err) => {
        this.log.error('POST api-settings failed', err, settings);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Gets all issued API keys (metadata only).
   */
  getKeys(): Observable<ApiKey[]> {
    this.log.debug('GET api-keys request started');

    return this.http.get<ApiKey[]>(`${this.baseUrl}/api-keys`).pipe(
      tap((result) => this.log.info('GET api-keys successful', { count: result.length })),
      catchError((err) => {
        this.log.error('GET api-keys failed', err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Creates a new API key. The response contains the plaintext key exactly once.
   */
  createKey(name: string, accessLevel: number): Observable<ApiKeyCreated> {
    this.log.debug('POST api-keys request started', { name, accessLevel });

    return this.http.post<ApiKeyCreated>(`${this.baseUrl}/api-keys`, { name, accessLevel }).pipe(
      tap((result) => this.log.info('POST api-keys successful', { id: result.apiKey.id })),
      catchError((err) => {
        this.log.error('POST api-keys failed', err, { name, accessLevel });
        return throwError(() => err);
      }),
    );
  }

  /**
   * Deletes (revokes) an API key by id.
   */
  deleteKey(id: string): Observable<void> {
    this.log.debug('DELETE api-keys request started', { id });

    return this.http.delete<void>(`${this.baseUrl}/api-keys/${id}`).pipe(
      tap(() => this.log.info('DELETE api-keys successful', { id })),
      catchError((err) => {
        this.log.error('DELETE api-keys failed', err, { id });
        return throwError(() => err);
      }),
    );
  }

  /**
   * Gets the API request log of the current backend session.
   */
  getLog(): Observable<ApiLogEntry[]> {
    this.log.debug('GET api-log request started');

    return this.http.get<ApiLogEntry[]>(`${this.baseUrl}/api-log`).pipe(
      tap((result) => this.log.info('GET api-log successful', { count: result.length })),
      catchError((err) => {
        this.log.error('GET api-log failed', err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Clears the API request log.
   */
  clearLog(): Observable<void> {
    this.log.debug('DELETE api-log request started');

    return this.http.delete<void>(`${this.baseUrl}/api-log`).pipe(
      tap(() => this.log.info('DELETE api-log successful')),
      catchError((err) => {
        this.log.error('DELETE api-log failed', err);
        return throwError(() => err);
      }),
    );
  }
}
