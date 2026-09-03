import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { provideMarkdown } from 'ngx-markdown';
import { firstValueFrom } from 'rxjs';
import translocoConfig from '../../transloco.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),

    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { ...new MatDialogConfig(), hasBackdrop: true },
    },
    provideHttpClient(),
    provideMarkdown(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),

    // Preload our current languages or our default languages as a fallback
    provideAppInitializer(async () => {
      const transloco = inject(TranslocoService);
      const defaultLanguage = translocoConfig.defaultLang ?? 'en';
      const languages = translocoConfig.langs ?? [defaultLanguage];
      transloco.setActiveLang(defaultLanguage);

      for (const language of languages) {
        await firstValueFrom(transloco.load(language));
      }
    }),
  ],
};
