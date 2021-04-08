import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: true,
    defaultNS: 'common',
    //loadPath: '/locales/{{lng}}/{{ns}}.json',
    backend: {
      loadPath:
        process.env.NODE_ENV !== 'production'
          ? `./locales/{{lng}}/{{ns}}.json`
          : `/locales/{{lng}}/{{ns}}.json`,
    },
  })

export default i18n
