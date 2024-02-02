const HttpBackend = require('i18next-http-backend/cjs')
const HMRPlugin =
  process.env.NODE_ENV !== 'production' ? require('i18next-hmr/plugin').HMRPlugin : undefined

const isDev = process.env.NODE_ENV === 'development'
const windowDefined = typeof window !== 'undefined'

const hmrConfig =
  !isDev && windowDefined
    ? [HttpBackend, new HMRPlugin({ webpack: { client: true } })]
    : [HMRPlugin ? new HMRPlugin({ webpack: { server: true } }) : undefined]

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt', 'cn'],
  },
  ...(windowDefined
    ? {
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
      }
    : {}),
  serializeConfig: false,
  reloadOnPrerender: isDev,
  use: isDev ? hmrConfig : [],
}
