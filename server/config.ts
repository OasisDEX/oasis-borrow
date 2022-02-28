import * as z from 'zod'

export const configSchema = z.object({
  disableRequestLogging: z.boolean().optional(),
  challengeJWTSecret: z.string(),
  userJWTSecret: z.string(),
})

export type Config = z.infer<typeof configSchema>
