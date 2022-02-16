import * as Sentry from '@sentry/nextjs'

import { sentryBaseConfig } from './sentry.base.config'

Sentry.init(sentryBaseConfig)
