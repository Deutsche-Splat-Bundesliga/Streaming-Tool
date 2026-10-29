import {
  afterNextRender,
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { Branding, DEFAULT_BRANDING } from '../models/branding';
import { BrandingApi } from './branding-api';
import { LogService } from './log';
import { Signalr } from './signalr';
import { Observable, tap } from 'rxjs';
import { BroadcastState } from '../models/broadcast-state';

@Injectable({
  providedIn: 'root',
})
export class BrandingService {
  private readonly _api = inject(BrandingApi);
  private readonly _signalr = inject(Signalr);
  private readonly _log = inject(LogService);

  readonly branding: WritableSignal<Branding> = signal({ ...DEFAULT_BRANDING });

  constructor() {
    effect(() => {
      const incoming = this._signalr.liveBranding();
      if (incoming) {
        this.branding.set(incoming);
      }
    });

    afterNextRender(() => {
      void this._signalr.start();
      this.loadInitialState();
    });
  }

  loadInitialState(): void {
    this._api.getBranding().subscribe({
      next: (branding) => this.branding.set(branding),
      error: (err) => this._log.error('Branding initial state request failed', err),
    });
  }

  updateBranding(branding: Branding): Observable<Branding> {
    return this._api.updateBranding(branding).pipe(
      tap({
        next: (updated) => this.branding.set(updated),
        error: (err: unknown) =>
          this._log.error('Branding update request failed', err, branding),
      }),
    );
  }

  uploadAsset(image: File): Observable<{ assetUrl: string }> {
    return this._api.uploadAsset(image);
  }

  tournamentInfo(state: BroadcastState): string {
    const tournamentName = state.tournamentName || this.branding().tournamentName;
    const info = state.isLeague
      ? `${tournamentName} Season ${state.season} - Woche ${state.week} - Division ${state.division}`
      : `${tournamentName} - ${state.bracketName}`;

    return info.replace(/- $/, '').trim();
  }
}
