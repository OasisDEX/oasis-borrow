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
export interface OasisStats {
  monthlyVolume: number
  managedOnOasis: number
  medianVaultSize: number
}

interface StatsResponse {
  Total_Locked_collateral_USD: number
  MEDIAN_Vault_size_USD: number
  '30_day_volume_USD': number
}

export function getOasisStats(): Promise<OasisStats> {
  return new Promise((resolve, reject) => {
    const snowFlakeConnection = config.enableSnowflake ? getSnowflakeConnection() : undefined

    if (!snowFlakeConnection) {
      return resolve({
        monthlyVolume: 10_000_000_000,
        managedOnOasis: 9_000_000_000_000,
        medianVaultSize: 21_370_000,
      })
    }
    snowFlakeConnection.connect((err, connection) => {
      if (err) {
        return reject(err)
      }
      connection.execute({
        sqlText: 'select * from "OAZO_ANALYTICS_DWH"."PUBLIC"."Front_end_data";',
        streamResult: false, // prevent rows from being returned inline in the complete callback
        complete: function (err, stmt, rows: StatsResponse[] | undefined) {
          if (err || !rows) {
            return reject(err)
          }

          console.log(rows)

          resolve({
            monthlyVolume: rows[0]['30_day_volume_USD'],
            managedOnOasis: rows[0]['Total_Locked_collateral_USD'],
            medianVaultSize: rows[0]['MEDIAN_Vault_size_USD'],
          })
        },
      })
    })
  })
}
