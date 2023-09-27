import {
  CaptureConsole as CaptureConsoleIntegration,
  HttpClient as HttpClientIntegration,
} from '@sentry/integrations'
import type { init } from '@sentry/nextjs'
import getConfig from 'next/config'

const SENTRY_DSN: string =
  'https://2fdf00b007464e2784ef445e16a6039f@o1143494.ingest.sentry.io/6204127'

type BaseConfig = Parameters<typeof init>[0]

export const sentryBaseConfig: BaseConfig = {
  dsn: SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENV,
  // release is also used for source map uploads at build time,
  // so ensure that SENTRY_RELEASE is the same at build time.
  release: process.env.SENTRY_RELEASE || getConfig()?.publicRuntimeConfig?.sentryRelease,
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENV !== 'development',
  tracesSampleRate: 0.01,
  sampleRate: 0.1,
  profilesSampleRate: 0.01,
  integrations: [new CaptureConsoleIntegration({ levels: ['error'] }), new HttpClientIntegration()],
  debug: false,
}
