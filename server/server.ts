/**
 * Custom Next.JS server based on https://nextjs.org/docs/advanced-features/custom-server
 * Provides http-auth for production environments
 */

import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import next from 'next'
import { join } from 'path'
import { parse } from 'url'

import { i18n } from '../next-i18next.config'
import { getApp } from './app'
import { configSchema } from './config'
import { sendMailUsingSMTP } from './middleware/emails/providers/emailProvider'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000
const DEV_HTTPS_PORT = 3443
const dev = process.env.NODE_ENV !== 'production'
// const enablePasswordProtection = !dev
// const PASSWORD = 'password!@#'

const nextApp = next({ dev })
const handleByNext = nextApp.getRequestHandler()

async function main() {
  const config = configSchema.parse({
    // httpPassword: enablePasswordProtection ? PASSWORD : undefined,
    challengeJWTSecret: process.env.CHALLENGE_JWT_SECRET,
    userJWTSecret: process.env.USER_JWT_SECRET,

    smtpSecret: {
      host: process.env.SMTP_SERVER_NAME,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD_SECRET,
    },

    contactEmailsSender: process.env.CONTACT_EMAILS_SENDER,
    contactEmailsReceiver: process.env.CONTACT_EMAILS_RECEIVER,
  })

  await nextApp.prepare()
  const app = getApp(config, {
    nextHandler: handleByNext as any,
    emailProvider: sendMailUsingSMTP({
      smtpConfig: config.smtpSecret,
      sender: config.contactEmailsSender,
      receiver: config.contactEmailsReceiver,
    }),
  })

  // Render landing pages for paths containing supported languages (e.g. /en /es)
  app.use((req: any, res: any, next: any): any => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl
    if (pathname && i18n.locales.includes(pathname.substr(1)))
      return nextApp.render(req, res, '/', query)
    next()
  })

  if (dev) {
    const options = {
      key: fs.readFileSync(join(__dirname, 'localhost.key')),
      cert: fs.readFileSync(join(__dirname, 'localhost.crt')),
    }
    https.createServer(options, app).listen(DEV_HTTPS_PORT, 'localhost', () => {
      console.log(`> Ready on https://localhost:${DEV_HTTPS_PORT}`)
    })
  }
  http.createServer(app).listen(PORT, '0.0.0.0', () => {
    console.log(`> Ready on http://0.0.0.0:${PORT}`)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
