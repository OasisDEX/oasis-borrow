const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt', 'cn'],
    localePath: path.resolve('./public/locales'),
  },
}
