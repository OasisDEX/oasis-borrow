import * as Sentry from '@sentry/nextjs'

import { sentryBaseConfig } from './sentry.base.config'

Sentry.init({
  ...sentryBaseConfig,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.7,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
