import getConfig from 'next/config'

const SENTRY_DSN: string =
  'https://2fdf00b007464e2784ef445e16a6039f@o1143494.ingest.sentry.io/6204127'

const SENTRY_URL = new URL(SENTRY_DSN)
const SENTRY_PROJECT_ID = SENTRY_URL.pathname.replace('/', '')
const SENTRY_HOST = SENTRY_URL.hostname

export const sentryBaseConfig = {
  dsn: SENTRY_DSN,
  projectId: SENTRY_PROJECT_ID,
  host: SENTRY_HOST,
  tracesSampleRate: 1.0,
  tunnel: '/api/sentry',
  environment: process.env.NEXT_PUBLIC_SENTRY_ENV,
  // release is also used for source map uploads at build time,
  // so ensure that SENTRY_RELEASE is the same at build time.
  release: process.env.SENTRY_RELEASE || getConfig()?.publicRuntimeConfig?.sentryRelease,
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENV !== 'development',
}
