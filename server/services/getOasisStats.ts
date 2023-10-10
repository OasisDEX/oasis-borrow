import type { OasisStats } from 'features/homepage/OasisStats'
import { config } from 'server/config'
import { getSnowflakeConnection } from 'server/snowflake'

interface StatsResponse {
  MEDIAN_VAULT_SIZE_USD: number
  LAST_MONTH_VOLUME_USD: number
  TOTAL_LOCKED_COLLATERAL_USD: number
  LOAD_TIME: number
  VAULTS_WITH_ACTIVE_TRIGGER: number
  EXECUTED_TRIGGERS_LAST_90_DAYS: number
  LOCKED_COLLATERAL_ACTIVE_TRIGGER: number
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
        sqlText: 'select * from "OAZO_ANALYTICS"."PUBLIC"."FE_DATA" ORDER by LOAD_TIME desc;',
        streamResult: false, // prevent rows from being returned inline in the complete callback
        complete: function (err, stmt, rows: StatsResponse[] | undefined) {
          if (err || !rows) {
            return resolve(null)
          }

          const data = {
            monthlyVolume: rows[0].LAST_MONTH_VOLUME_USD,
            managedOnOasis: rows[0].TOTAL_LOCKED_COLLATERAL_USD,
            medianVaultSize: rows[0].MEDIAN_VAULT_SIZE_USD,
            vaultsWithActiveTrigger: rows[0].VAULTS_WITH_ACTIVE_TRIGGER,
            executedTriggersLast90Days: rows[0].EXECUTED_TRIGGERS_LAST_90_DAYS,
            lockedCollateralActiveTrigger: rows[0].LOCKED_COLLATERAL_ACTIVE_TRIGGER,
            triggersSuccessRate: 100,
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
