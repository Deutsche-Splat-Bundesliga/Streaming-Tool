import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import en from '../../public/i18n/en-US.json';
import de from '../../public/i18n/de-DE.json';

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { en, de },
    translocoConfig: {
      availableLangs: ['en-US', 'de-DE'],
      defaultLang: 'en-US',
    },
    preloadLangs: true,
    ...options,
  });
}
