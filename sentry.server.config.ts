import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN: string =
  'https://2fdf00b007464e2784ef445e16a6039f@o1143494.ingest.sentry.io/6204127'

Sentry.init({
  dsn: SENTRY_DSN,
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENV,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
})
