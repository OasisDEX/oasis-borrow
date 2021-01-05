import * as z from 'zod'

export const configSchema = z.object({
  httpPassword: z.string().optional(),
  disableRequestLogging: z.boolean().optional(),
  challengeJWTSecret: z.string(),
  userJWTSecret: z.string(),
  smtpSecret: z.object({
    host: z.string(),
    port: z.string(),
    user: z.string(),
    pass: z.string(),
  }),

  contactEmailsSender: z.string(),
  contactEmailsReceiver: z.string(),
})

export type Config = z.infer<typeof configSchema>
