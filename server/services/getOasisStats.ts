import { OasisStats } from '../../features/homepage/OasisStats'
import { config } from '../config'
import { getSnowflakeConnection } from '../snowflake'

interface StatsResponse {
  Total_Locked_collateral_USD: number
  MEDIAN_Vault_size_USD: number
  '30_day_volume_USD': number
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
        sqlText: 'select * from "OAZO_ANALYTICS_DWH"."PUBLIC"."Front_end_data";',
        streamResult: false, // prevent rows from being returned inline in the complete callback
        complete: function (err, stmt, rows: StatsResponse[] | undefined) {
          if (err || !rows) {
            return resolve(null)
          }

          const data = {
            monthlyVolume: rows[0]['30_day_volume_USD'],
            managedOnOasis: rows[0]['Total_Locked_collateral_USD'],
            medianVaultSize: rows[0]['MEDIAN_Vault_size_USD'],
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
