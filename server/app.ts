import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import basicAuth from 'express-basic-auth'
import jwt from 'express-jwt'
import morgan from 'morgan'

import { Config } from './config'
import { jwtAuthMiddleware } from './middleware/signature-auth'
import { tosRoutes } from './middleware/tos'

const path = ''

export interface Dependencies {
  nextHandler: express.Handler
}

export function getApp(config: Config, { nextHandler }: Dependencies): express.Application {
  const app = express()
  app.enable('trust proxy')

  if (config.httpPassword) {
    console.log('Enabling http-auth...')
    const httpBasic = basicAuth({
      challenge: true,
      users: { admin: config.httpPassword },
    })
    app.use((req, res, next) => {
      // do not require http-auth on /api
      if (!req.path.startsWith('/api')) {
        return httpBasic(req, res, next)
      }
      next()
    })
  }

  app.use(bodyParser.json())
  app.use(cookieParser())

  if (!config.disableRequestLogging) {
    app.use('/api', morgan('tiny'))
  }

  app.use(`${path}/api/auth`, jwtAuthMiddleware(config))
  app.use(
    `${path}/api/tos`,
    jwt({ secret: config.userJWTSecret, algorithms: ['HS512'] }),
    tosRoutes(),
  )

  app.use((err: any, _req: any, res: any, _next: any) => {
    // is there a better way to detect zod validation error?
    if (err.bubbleUp) {
      res.status(400).send({ error: err.message })
      return
    }
    if (err.status) {
      res.status(err.status).send({ name: err.name })
      return
    }
    console.error('Internal error occured!', err)
    res.status(500).send({ name: 'InternalError' })
  })

  app.all('*', nextHandler)

  return app
}
