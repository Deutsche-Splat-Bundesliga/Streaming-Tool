import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

const config: TranslocoGlobalConfig = {
  rootTranslationsPath: 'public/i18n/',
  langs: ['en-US', 'de-DE'],
  defaultLang: 'en-US',
  keysManager: {},
};

export default config;
