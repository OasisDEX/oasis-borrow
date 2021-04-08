import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from '../public/locales/en/common.json'

const resources = {
  en: {
    translation: enTranslation,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  debug: true,
})

export default i18n
