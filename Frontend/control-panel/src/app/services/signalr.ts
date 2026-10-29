import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BroadcastState } from '../models/broadcast-state';
import { Socials } from '../models/socials';
import { CommentatorBoxTimeData } from '../models/commentator-box-time-data';
import { ApiSettings } from '../models/api-settings';
import { ApiKey } from '../models/api-key';
import { ApiLogEntry } from '../models/api-log-entry';
import { Branding } from '../models/branding';
import { LogService } from './log';

@Injectable({
  providedIn: 'root',
})
export class Signalr {
  private readonly _log = inject(LogService);

  private _connection?: signalR.HubConnection;

  /**
   * Connects the SignalR client to the broadcastStateUpdated stream
   */
  private connectToState = () => {
    this._connection?.on('broadcastStateUpdated', (state: BroadcastState) => {
      this._log.debug('SignalR broadcastStateUpdated received', state);

      this.liveState.set(state);
    });
  };

  /**
   * Connects the SignalR client to the socialsUpdated stream
   */
  private connectToSocials = () => {
    this._connection?.on('socialsUpdated', (socials: Socials) => {
      this._log.debug('SignalR socialsUpdated received', socials);

      this.liveSocials.set(socials);
    });
  };

  /**
   * Connects the SignalR client to the commentatorBoxTimeDataUpdated stream
   */
  private connectToCommentatorBoxTimeData = () => {
    this._connection?.on('commentatorBoxTimeDataUpdated', (timeData: CommentatorBoxTimeData) => {
      this._log.debug('SignalR commentatorBoxTimeDataUpdated received', timeData);

      this.liveCommentatorBoxTimeData.set(timeData);
    });
  };

  /**
   * Maximum number of API log entries kept in the live buffer. Matches the backend's limit.
   */
  private static readonly MAX_API_LOG_ENTRIES = 200;

  /**
   * Connects the SignalR client to all API management streams
   * (settings, keys, and the live request log).
   */
  private connectToApi = () => {
    this._connection?.on('apiSettingsUpdated', (settings: ApiSettings) => {
      this._log.debug('SignalR apiSettingsUpdated received', settings);

      this.liveApiSettings.set(settings);
    });

    this._connection?.on('apiKeysUpdated', (keys: ApiKey[]) => {
      this._log.debug('SignalR apiKeysUpdated received', { count: keys.length });

      this.liveApiKeys.set(keys);
    });

    this._connection?.on('apiLogEntryAdded', (entry: ApiLogEntry) => {
      this._log.debug('SignalR apiLogEntryAdded received', entry);

      const next = [...this.liveApiLog(), entry];

      if (next.length > Signalr.MAX_API_LOG_ENTRIES) {
        next.splice(0, next.length - Signalr.MAX_API_LOG_ENTRIES);
      }

      this.liveApiLog.set(next);
    });

    this._connection?.on('apiLogCleared', () => {
      this._log.debug('SignalR apiLogCleared received');

      this.liveApiLog.set([]);
    });
  };

  private connectToBranding = () => {
    this._connection?.on('brandingUpdated', (branding: Branding) => {
      this._log.debug('SignalR brandingUpdated received', branding);
      this.liveBranding.set(branding);
    });
  };

  liveState: WritableSignal<BroadcastState | null> = signal<BroadcastState | null>(null);

  liveSocials: WritableSignal<Socials | null> = signal<Socials | null>(null);

  liveCommentatorBoxTimeData: WritableSignal<CommentatorBoxTimeData | null> =
    signal<CommentatorBoxTimeData | null>(null);

  /**
   * Latest known API settings pushed from the backend.
   */
  liveApiSettings: WritableSignal<ApiSettings | null> = signal<ApiSettings | null>(null);

  liveBranding: WritableSignal<Branding | null> = signal<Branding | null>(null);

  /**
   * Latest known list of issued API keys pushed from the backend.
   */
  liveApiKeys: WritableSignal<ApiKey[] | null> = signal<ApiKey[] | null>(null);

  /**
   * The live API request log of the current session. Seeded from REST on load,
   * then appended to as `apiLogEntryAdded` events arrive.
   */
  liveApiLog: WritableSignal<ApiLogEntry[]> = signal<ApiLogEntry[]>([]);

  isConnected: WritableSignal<boolean> = signal<boolean>(false);

  private connectToAllStreams = () => {
    this.connectToState();
    this.connectToSocials();
    this.connectToCommentatorBoxTimeData();
    this.connectToApi();
    this.connectToBranding();
  };

  /**
   * Starts SignalR connection
   */
  async start() {
    if (this._connection) {
      return;
    }

    const scope = this._log.beginScope('Signalr.start');

    this._log.info('Initializing SignalR connection');

    this._connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:7000/overlayHub')
      .withAutomaticReconnect()
      .build();

    this._log.debug('Registering SignalR handlers');
    this.connectToAllStreams();

    this._connection.onreconnecting(() => {
      this.isConnected.set(false);
      this._log.warn('SignalR reconnecting...');
    });

    this._connection.onreconnected(() => {
      this.isConnected.set(true);
      this._log.info('SignalR reconnected');
    });

    this._connection.onclose(() => {
      this.isConnected.set(false);
      this._log.error('SignalR connection closed');
    });

    await this.tryConnect();

    scope.dispose();
  }

  /**
   * Connection retry logic
   */
  private async tryConnect(): Promise<void> {
    try {
      this._log.info('Starting SignalR connection attempt');

      await this._connection?.start();

      this.isConnected.set(true);

      this._log.info('SignalR connected successfully');
    } catch (err) {
      this.isConnected.set(false);

      this._log.error('SignalR connection failed, retrying...', err);

      setTimeout(() => this.tryConnect(), 5000);
    }
  }
}
