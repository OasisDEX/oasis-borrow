import * as z from 'zod'

export const configSchema = z.object({
  challengeJWTSecret: z.string(),
  userJWTSecret: z.string(),
  snowflakeAccount: z.string().optional(),
  snowflakeUser: z.string().optional(),
  snowflakePassword: z.string().optional(),
  enableSnowflake: z.boolean().optional(),
})

export const config = configSchema.parse({
  challengeJWTSecret: process.env.CHALLENGE_JWT_SECRET,
  userJWTSecret: process.env.USER_JWT_SECRET,
  snowflakeAccount: process.env.SNOWFLAKE_ACCOUNT,
  snowflakeUser: process.env.SNOWFLAKE_USER,
  snowflakePassword: process.env.SNOWFLAKE_PASSWORD,
  enableSnowflake: JSON.parse(process.env.ENABLE_SNOWFLAKE || 'false'),
})

export type Config = z.infer<typeof configSchema>
