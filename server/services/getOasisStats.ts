import { OasisStats } from '../../features/homepage/OasisStats'
import { config } from '../config'
import { getSnowflakeConnection } from '../snowflake'

interface StatsResponse {
  MEDIAN_VAULT_SIZE_USD: number
  LAST_MONTH_VOLUME_USD: number
  TOTAL_LOCKED_COLLATERAL_USD: number
  LOAD_TIME: number
}

export function getOasisStats(): Promise<OasisStats | null> {
  return new Promise((resolve) => {
    const snowFlakeConnection = config.enableSnowflake ? getSnowflakeConnection() : undefined

    if (!snowFlakeConnection) {
      return resolve(null)
    }
    snowFlakeConnection.connect((err, connection) => {
      if (err) {
        return resolve(null)
      }
      connection.execute({
        sqlText: 'select * from "OAZO_ANALYTICS_DWH"."PUBLIC"."FE_DATA";',
        streamResult: false, // prevent rows from being returned inline in the complete callback
        complete: function (err, stmt, rows: StatsResponse[] | undefined) {
          if (err || !rows) {
            return resolve(null)
          }

          const data = {
            monthlyVolume: rows[0].LAST_MONTH_VOLUME_USD,
            managedOnOasis: rows[0].TOTAL_LOCKED_COLLATERAL_USD,
            medianVaultSize: rows[0].MEDIAN_VAULT_SIZE_USD,
          }

          if (!Object.values(data).every((value) => value !== null)) {
            resolve(null)
          }

          resolve(data)
        },
      })
    })
  })
}
