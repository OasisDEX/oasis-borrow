import express from 'express'
import { NextApiRequest, NextApiResponse } from 'next'
import { apiResolver } from 'next/dist/next-server/server/api-utils'
import { EmailProvider } from 'server/middleware/emails/types'

import * as gasPriceHandler from '../../pages/api/gasPrice'
import * as healthHandler from '../../pages/api/health'
import { Dependencies, getApp } from '../../server/app'
import { Config } from '../../server/config'

export const DEFAULT_CONFIG: Config = {
  disableRequestLogging: true,
  challengeJWTSecret: 'fnt123',
  userJWTSecret: 'user-jwt-123',
}

function nextApiResolver(handler: {
  default: (req: NextApiRequest, res: NextApiResponse) => void
}): express.RequestHandler {
  const emptyApiContext = {
    previewModeId: '',
    previewModeEncryptionKey: '',
    previewModeSigningKey: '',
  }
  return (req: express.Request, res: express.Response) => {
    return apiResolver(req, res, { ...req.params, ...req.query }, handler, emptyApiContext, true)
  }
}

export function setupServer(
  customConfig: Partial<Config> = {},
  customDependencies: Partial<Dependencies> = {},
): express.Application {
  function noopHandler(_req: express.Request, _res: express.Response, next: express.NextFunction) {
    next()
  }

  // eslint-disable-next-line
  const noopEmailProvider: EmailProvider = async () => {}

  const app = getApp(
    { ...DEFAULT_CONFIG, ...customConfig },
    {
      nextHandler: noopHandler,
      ...customDependencies,
    },
  )
  app.get('/api/health', nextApiResolver(healthHandler))
  app.get('/api/gasPrice', nextApiResolver(gasPriceHandler))

  return app
}
