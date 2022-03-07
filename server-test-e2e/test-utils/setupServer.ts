import express from 'express'

import { Dependencies, getApp } from '../../server/app'
import { Config } from '../../server/config'

export const DEFAULT_CONFIG: Config = {
  disableRequestLogging: true,
  challengeJWTSecret: 'fnt123',
  userJWTSecret: 'user-jwt-123',
}

export function setupServer(
  customConfig: Partial<Config> = {},
  customDependencies: Partial<Dependencies> = {},
): express.Application {
  function noopHandler(_req: express.Request, _res: express.Response, next: express.NextFunction) {
    next()
  }

  const app = getApp(
    { ...DEFAULT_CONFIG, ...customConfig },
    {
      nextHandler: noopHandler,
      ...customDependencies,
    },
  )

  return app
}
