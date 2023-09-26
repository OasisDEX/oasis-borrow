const HttpBackend = require('i18next-http-backend/cjs')
const HMRPlugin =
  process.env.NODE_ENV !== 'production' ? require('i18next-hmr/plugin').HMRPlugin : undefined

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt', 'cn'],
  },
  ...(typeof window !== 'undefined'
    ? {
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
      }
    : {}),
  serializeConfig: false,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  use:
    process.env.NODE_ENV !== 'production'
      ? typeof window !== 'undefined'
        ? [HttpBackend, new HMRPlugin({ webpack: { client: true } })]
        : [new HMRPlugin({ webpack: { server: true } })]
      : [],
}
