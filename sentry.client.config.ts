import { init } from '@sentry/nextjs'

import { sentryBaseConfig } from './sentry.base.config'

init({
  ...sentryBaseConfig,
})
