import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SocialsApi } from './socials-api';
import { Signalr } from './signalr';
import { Socials } from '../models/socials';
import { SignalrServiceConnection } from '../enums/SignalrServiceConnection';
import { LogService } from './log';

@Injectable({
  providedIn: 'root',
})
export class SocialsService {
  private readonly _api: SocialsApi = inject(SocialsApi);
  private readonly _signalr: Signalr = inject(Signalr);
  private readonly _log = inject(LogService);

  /**
   * The main socials signal that holds the current socials.
   */
  socials: WritableSignal<Socials> = signal<Socials>({
    xHandle: '@Temp',
    discordInvite: 'Temp',
  });

  /**
   * Initializes the SocialsService and connects SignalR updates.
   */
  constructor() {
    const scope = this._log.beginScope('SocialsService');

    this._log.info('Initializing SocialsService');

    effect(() => {
      const incoming = this._signalr.liveSocials();

      if (!incoming) return;

      this._log.debug('Received SignalR socials update', incoming);

      this.socials.set(incoming);

      this._log.info('Socials updated from SignalR');
    });

    this._signalr.connectionType = SignalrServiceConnection.Socials;

    this._signalr.start();

    this._log.info('SignalR connection started');

    scope.dispose();
  }

  /**
   * Updates socials and sends them to the backend.
   */
  update(partial: Partial<Socials>): void {
    const scope = this._log.beginScope('SocialsService.update');

    try {
      const newSocials = {
        ...this.socials(),
        ...partial,
      };

      this._log.debug('Updating socials', {
        before: this.socials(),
        patch: partial,
        after: newSocials,
      });

      this.socials.set(newSocials);

      this._api.updateSocials(newSocials).subscribe({
        next: () => {
          this._log.info('Socials successfully updated via API');
        },
        error: (err) => {
          this._log.error('Failed to update socials', err, newSocials);
        },
      });
    } finally {
      scope.dispose();
    }
  }

  /**
   * Loads initial socials state from backend.
   */
  loadInitialState(): void {
    const scope = this._log.beginScope('SocialsService.loadInitialState');

    this._log.info('Loading initial socials state');

    this._api.getSocials().subscribe({
      next: (socials) => {
        this._log.debug('Initial socials received', socials);

        this.socials.set(socials);

        this._log.info('Initial socials state applied');
      },
      error: (err) => {
        this._log.error('Failed to load initial socials state', err);
      },
    });

    scope.dispose();
  }
}
