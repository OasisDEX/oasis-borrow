import { config } from 'server/config'
import snowflake from 'snowflake-sdk'

export function getSnowflakeConnection(): snowflake.Connection {
  return snowflake.createConnection({
    account: config.snowflakeAccount!,
    username: config.snowflakeUser!,
    password: config.snowflakePassword,
    application: 'Oasis.app',
  })
}
