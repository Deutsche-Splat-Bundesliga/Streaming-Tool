import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiManagementApi } from './api-management-api';
import { Signalr } from './signalr';
import { ApiSettings } from '../models/api-settings';
import { ApiKey } from '../models/api-key';
import { ApiKeyCreated } from '../models/api-key-created';
import { ApiLogEntry } from '../models/api-log-entry';
import { SignalrServiceConnection } from '../enums/SignalrServiceConnection';
import { LogService } from './log';

/**
 * Manages the API settings, issued API keys and the live API request log,
 * keeping them in sync with the backend via REST and SignalR.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiManagementService {
  private readonly _api = inject(ApiManagementApi);
  private readonly _signalr = inject(Signalr);
  private readonly _log = inject(LogService);

  /**
   * The current API settings.
   */
  settings: WritableSignal<ApiSettings> = signal<ApiSettings>({
    allowUnauthenticatedRequests: true,
  });

  /**
   * The list of currently issued API keys.
   */
  keys: WritableSignal<ApiKey[]> = signal<ApiKey[]>([]);

  /**
   * The live API request log of the current session (owned by the Signalr service).
   */
  log$: WritableSignal<ApiLogEntry[]> = this._signalr.liveApiLog;

  /**
   * Initializes the service and wires up the SignalR live updates.
   */
  constructor() {
    const scope = this._log.beginScope('ApiManagementService');

    this._log.info('Initializing ApiManagementService');

    effect(() => {
      const incoming = this._signalr.liveApiSettings();

      if (!incoming) return;

      this._log.debug('Received SignalR API settings update', incoming);

      this.settings.set(incoming);
    });

    effect(() => {
      const incoming = this._signalr.liveApiKeys();

      if (!incoming) return;

      this._log.debug('Received SignalR API keys update', { count: incoming.length });

      this.keys.set(incoming);
    });

    this._signalr.connectionType = SignalrServiceConnection.Api;

    this._signalr.start();

    this._log.info('SignalR connection started (Api)');

    scope.dispose();
  }

  /**
   * Loads the initial API settings, keys and log from the backend.
   */
  loadInitialState(): void {
    const scope = this._log.beginScope('ApiManagementService.loadInitialState');

    this._log.info('Loading initial API management state');

    this.api.getSettings().subscribe({
      next: (settings) => this.settings.set(settings),
      error: (err) => this._log.error('Failed to load API settings', err),
    });

    this.api.getKeys().subscribe({
      next: (keys) => this.keys.set(keys),
      error: (err) => this._log.error('Failed to load API keys', err),
    });

    this.api.getLog().subscribe({
      next: (entries) => this._signalr.liveApiLog.set(entries),
      error: (err) => this._log.error('Failed to load API log', err),
    });

    scope.dispose();
  }

  /**
   * Updates whether unauthenticated API requests are allowed.
   * @param {boolean} allow Whether unauthenticated requests should be allowed.
   */
  setAllowUnauthenticatedRequests(allow: boolean): void {
    const scope = this._log.beginScope('ApiManagementService.setAllowUnauthenticatedRequests');

    const newSettings: ApiSettings = { allowUnauthenticatedRequests: allow };

    this.settings.set(newSettings);

    this.api.updateSettings(newSettings).subscribe({
      next: () => this._log.info('API settings updated via API'),
      error: (err) => this._log.error('Failed to update API settings', err, newSettings),
    });

    scope.dispose();
  }

  /**
   * Creates a new API key. The returned observable yields the plaintext key exactly once.
   * @param {string} name The human-readable name of the key (e.g. "Stream Deck").
   * @param {number} accessLevel The access level of the key (0 = read-only, 1 = read-write).
   * @returns {Observable<ApiKeyCreated>} An observable emitting the created {@link ApiKeyCreated}, including the plaintext key.
   */
  createKey(name: string, accessLevel: number): Observable<ApiKeyCreated> {
    this._log.info('Creating API key', { name, accessLevel });

    // Intentionally log no data derived from the created key object: it carries the
    // plaintext key (shown once in the UI) and must never reach the console/log sink.
    return this.api.createKey(name, accessLevel).pipe(tap(() => this._log.info('API key created')));
  }

  /**
   * Deletes (revokes) an API key by id.
   * @param {string} id The id of the key to delete.
   */
  deleteKey(id: string): void {
    this._log.info('Deleting API key', { id });

    this.api.deleteKey(id).subscribe({
      next: () => this._log.info('API key deleted'),
      error: (err) => this._log.error('Failed to delete API key', err, { id }),
    });
  }

  /**
   * Clears the API request log.
   */
  clearLog(): void {
    this._log.info('Clearing API log');

    this._signalr.liveApiLog.set([]);

    this.api.clearLog().subscribe({
      next: () => this._log.info('API log cleared'),
      error: (err) => this._log.error('Failed to clear API log', err),
    });
  }
}
