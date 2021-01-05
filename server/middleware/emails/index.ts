import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import * as z from 'zod'

import { EmailProvider } from './types'

const inputSchema = z.object({
  data: z.object({
    name: z.string().optional(),
    email: z.string(),
    subject: z.string(),
    message: z.string(),
  }),
})

export function contactFormMiddleware(emailProvider: EmailProvider): express.RequestHandler {
  return Router().post(
    '/',
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { data } = inputSchema.parse(req.body)

      const htmlTemplate = `
        Name: <strong>${data.name}</strong></br>
        Email: <strong>${data.email}</strong></br>
        Message: ${data.message}
      `

      const subject = data.subject
      const replyTo = data.name
        ? {
            address: data.email,
            name: data.name,
          }
        : data.email

      // Amazon SES only allows `from` field to be populated with verified domains, so we can't use data.email as value
      // https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html
      await emailProvider({
        subject,
        html: htmlTemplate,
        replyTo,
      })
      res.status(201).json({ status: 'OK' })
    }),
  )
}
