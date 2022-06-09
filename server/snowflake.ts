import snowflake from 'snowflake-sdk'
import { config } from './config'

function getSnowflakeConnection(): snowflake.Connection {
  return snowflake.createConnection({
    account: config.snowflakeAccount!,
    username: config.snowflakeUser!,
    password: config.snowflakePassword,
    application: 'Oasis.app',
  })
}

export const snowFlakeConnection = config.enableSnowflake ? getSnowflakeConnection() : undefined

export interface OasisStats {
  monthlyVolume: number
  managedOnOasis: number
  medianVaultSize: number
}

interface StatsResponse {
  SUM_Locked_collateral_USD: number
  AVG_Locked_collateral_USD: number
  'SUM_ABS(Collateral_USD)': number
}

export function getOasisStats(): Promise<OasisStats> {
  return new Promise((resolve, reject) => {
    if (!snowFlakeConnection) {
      return resolve({
        monthlyVolume: 10_000_000_000,
        managedOnOasis: 9_000_000_000_000,
        medianVaultSize: 21_370_000,
      })
    }
    snowFlakeConnection.execute({
      sqlText: 'select * from "OAZO_ANALYTICS_DWH"."PUBLIC"."FE_test";',
      streamResult: false, // prevent rows from being returned inline in the complete callback
      complete: function (err, stmt, rows: StatsResponse[] | undefined) {
        if (err || !rows) {
          return reject(err)
        }

        resolve({
          monthlyVolume: rows[0]['SUM_Locked_collateral_USD'],
          managedOnOasis: rows[0].AVG_Locked_collateral_USD,
          medianVaultSize: rows[0].SUM_Locked_collateral_USD,
        })
      },
    })
  })
}
