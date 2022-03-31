import jwt from 'express-jwt'
import { runMiddleware } from 'helpers/runMiddleware'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

import { config } from './config'

export const userJwt = jwt({ secret: config.userJWTSecret, algorithms: ['HS512'] })

export function withJwt(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await runMiddleware(req, res, userJwt)
    } catch {
      res.status(401).send({ error: 'Unauthorized' })
    }
    handler(req, res)
  }
}
