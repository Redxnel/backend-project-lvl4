import i18next from 'i18next';
import Backend from 'i18next-sync-fs-backend';
import path from 'path';

export default () => {
  i18next
    .use(Backend)
    .init({
      backend: {
        loadPath: path.resolve('./locales/{{lng}}/{{ns}}.json'),
        addPath: path.resolve('./locales/{{lng}}/{{ns}}.missing.json'),
      },
      preload: ['en'],
      defaultNS: 'validation',
      lng: 'en',
      ns: ['validation', 'flash-messages'],
    }, (err) => {
      if (err) {
        console.error(err);
      }
    });

  return i18next;
};
