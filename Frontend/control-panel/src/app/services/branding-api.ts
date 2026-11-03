import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Branding } from '../models/branding';
import { LogService } from './log';

@Injectable({
  providedIn: 'root',
})
export class BrandingApi {
  private readonly _http = inject(HttpClient);
  private readonly _log = inject(LogService);
  private readonly _url = 'http://localhost:7000/api/branding';

  getBranding(): Observable<Branding> {
    return this._http.get<Branding>(this._url).pipe(
      tap(() => this._log.info('Branding loaded')),
      catchError((err) => {
        this._log.error('Failed to load branding', err);
        return throwError(() => err);
      }),
    );
  }

  updateBranding(branding: Branding): Observable<Branding> {
    return this._http.post<Branding>(this._url, branding).pipe(
      tap(() => this._log.info('Branding updated')),
      catchError((err) => {
        this._log.error('Failed to update branding', err);
        return throwError(() => err);
      }),
    );
  }

  uploadAsset(image: File): Observable<{ assetUrl: string }> {
    const formData = new FormData();
    formData.append('image', image, image.name);

    return this._http.post<{ assetUrl: string }>(`${this._url}/assets`, formData).pipe(
      tap(() => this._log.info('Branding image uploaded')),
      catchError((err) => {
        this._log.error('Branding image upload failed', err);
        return throwError(() => err);
      }),
    );
  }
}
