import * as z from 'zod'

export const configSchema = z.object({
  challengeJWTSecret: z.string(),
  userJWTSecret: z.string(),
  rpcNode: z.string(),
})

export const config = configSchema.parse({
  challengeJWTSecret: process.env.CHALLENGE_JWT_SECRET,
  userJWTSecret: process.env.USER_JWT_SECRET,
  rpcNode: process.env.RPC_NODE,
})

export type Config = z.infer<typeof configSchema>
