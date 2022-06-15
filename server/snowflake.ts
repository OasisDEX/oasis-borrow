import snowflake from 'snowflake-sdk'

import { config } from './config'

export function getSnowflakeConnection(): snowflake.Connection {
  return snowflake.createConnection({
    account: config.snowflakeAccount!,
    username: config.snowflakeUser!,
    password: config.snowflakePassword,
    application: 'Oasis.app',
  })
}
