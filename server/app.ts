import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import morgan from 'morgan'

import { Config } from './config'

const path = ''

export interface Dependencies {
  nextHandler: express.Handler
}

export function getApp(config: Config, { nextHandler }: Dependencies): express.Application {
  const app = express()
  app.enable('trust proxy')

  app.use(bodyParser.json())
  app.use(cookieParser())

  if (!config.disableRequestLogging) {
    app.use('/api', morgan('tiny'))
  }

  // app.post(
  //   `${path}/api/vault`,
  //   jwt({ secret: config.userJWTSecret, algorithms: ['HS512'] }),
  //   createOrUpdate,
  // )

  // app.use((err: any, _req: any, res: any, _next: any) => {
  //   // is there a better way to detect zod validation error?
  //   if (err.bubbleUp) {
  //     res.status(400).send({ error: err.message })
  //     return
  //   }
  //   if (err.status) {
  //     res.status(err.status).send({ name: err.name })
  //     return
  //   }
  //   console.error('Internal error occured!', err)
  //   res.status(500).send({ name: 'InternalError' })
  // })

  app.all('*', nextHandler)

  return app
}
