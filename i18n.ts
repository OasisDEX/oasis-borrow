import NextI18Next from 'next-i18next'

const landingPageLanguageDetection = {
  name: 'landing-page-language-detection',
  lookup: (req: any) => {
    const path = typeof document !== 'undefined' ? document.location.pathname : req.url
    return NextI18NextInstance.config.allLanguages.includes(path.substr(1)) ? path.substr(1) : null
  },
}

const NextI18NextInstance = new NextI18Next({
  defaultLanguage: 'en',
  defaultNS: 'common',
  localePath: 'public/locales',
  otherLanguages: ['es', 'pt'],
  customDetectors: [landingPageLanguageDetection],
  detection: {
    order: ['landing-page-language-detection', 'querystring', 'cookie', 'header'],
    lookupQuerystring: 'lang',
  },
  keySeparator: '.',
})

export const { appWithTranslation, useTranslation, withTranslation, Trans } = NextI18NextInstance

/* eslint-disable */
export default NextI18NextInstance
