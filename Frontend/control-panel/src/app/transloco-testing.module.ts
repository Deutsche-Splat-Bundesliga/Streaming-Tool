import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import enUS from '../../public/i18n/en-US.json';
import deDE from '../../public/i18n/de-DE.json';

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: {
      'en-US': enUS,
      'de-DE': deDE,
    },
    translocoConfig: {
      availableLangs: ['en-US', 'de-DE'],
      defaultLang: 'en-US',
    },
    preloadLangs: true,
    ...options,
  });
}
