// const landingPageLanguageDetection = {
//   name: 'landing-page-language-detection',
//   lookup: (req: any) => {
//     const path = typeof document !== 'undefined' ? document.location.pathname : req.url
//     return NextI18NextInstance.config.allLanguages.includes(path.substr(1)) ? path.substr(1) : null
//   },
// }

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt'],
  },
}
