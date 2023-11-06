import * as z from 'zod'

// Adding env vars to this file will make them validated for existance during runtime
// this way we can be sure that they are always present

export const configSchema = z.object({
  challengeJWTSecret: z.string(),
  userJWTSecret: z.string(),
  snowflakeAccount: z.string().optional(),
  snowflakeUser: z.string().optional(),
  snowflakePassword: z.string().optional(),
  enableSnowflake: z.boolean().optional(),
  oneInchApiKey: z.string(),
  oneInchApiUrl: z.string(),
})

export const config = configSchema.parse({
  challengeJWTSecret: process.env.CHALLENGE_JWT_SECRET,
  userJWTSecret: process.env.USER_JWT_SECRET,
  snowflakeAccount: process.env.SNOWFLAKE_ACCOUNT,
  snowflakeUser: process.env.SNOWFLAKE_USER,
  snowflakePassword: process.env.SNOWFLAKE_PASSWORD,
  enableSnowflake: JSON.parse(process.env.ENABLE_SNOWFLAKE || 'false'),
  oneInchApiKey: process.env.ONE_INCH_API_KEY,
  oneInchApiUrl: process.env.ONE_INCH_API_URL,
})

export type Config = z.infer<typeof configSchema>
