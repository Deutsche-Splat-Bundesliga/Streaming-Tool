import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Socials } from '../models/socials';
import { LogService } from './log';

@Injectable({
  providedIn: 'root',
})
export class SocialsApi {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _log: LogService = inject(LogService);

  private readonly _baseUrl: string = 'http://localhost:7000/api/socials';

  /**
   * Gets the current socials from the backend API.
   */
  getSocials(): Observable<Socials> {
    this._log.debug('GET socials request started');

    return this._http.get<Socials>(`${this._baseUrl}/socials`).pipe(
      tap((result) => {
        this._log.info('GET socials successful', {
          hasXHandle: !!result.xHandle,
          hasDiscordInvite: !!result.discordInvite,
        });
      }),
      catchError((err) => {
        this._log.error('GET socials failed', err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Updates the socials via backend API.
   */
  updateSocials(socials: Socials): Observable<Socials> {
    this._log.debug('POST socials request started', {
      hasXHandle: !!socials.xHandle,
      hasDiscordInvite: !!socials.discordInvite,
    });

    return this._http.post<Socials>(`${this._baseUrl}/socials`, socials).pipe(
      tap((result) => {
        this._log.info('POST socials successful', {
          hasXHandle: !!result.xHandle,
          hasDiscordInvite: !!result.discordInvite,
        });
      }),
      catchError((err) => {
        this._log.error('POST socials failed', err, socials);
        return throwError(() => err);
      }),
    );
  }
}
