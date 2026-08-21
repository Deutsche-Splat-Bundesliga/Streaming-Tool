import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { LogService } from './log';

@Injectable({
  providedIn: 'root',
})
export class SignalrEvents {
  private readonly _log = inject(LogService);

  connection?: signalR.HubConnection;

  isConnected: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Calls start function so the service can be used globally
   */
  constructor() {
    this._start();
  }

  /**
   * Starts SignalR connection
   */
  private async _start() {
    const scope = this._log.beginScope('SignalrEvents.start');

    this._log.info('Initializing SignalR eventHub connection');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:7000/eventHub')
      .withAutomaticReconnect()
      .build();

    this.connection.onreconnecting(() => {
      this.isConnected.set(false);
      this._log.warn('SignalR Events reconnecting...');
    });

    this.connection.onreconnected(() => {
      this.isConnected.set(true);
      this._log.info('SignalR Events reconnected');
    });

    this.connection.onclose(() => {
      this.isConnected.set(false);
      this._log.error('SignalR Events connection closed');
    });

    await this._tryConnect();

    scope.dispose();
  }

  /**
   * Connection retry logic
   */
  private async _tryConnect(): Promise<void> {
    try {
      this._log.info('Starting SignalR Events connection attempt');

      await this.connection?.start();

      this.isConnected.set(true);

      this._log.info('SignalR Events connected successfully');
    } catch (err) {
      this.isConnected.set(false);

      this._log.error('SignalR Events connection failed, retrying...', err);

      setTimeout(() => this._tryConnect(), 5000);
    }
  }
}
