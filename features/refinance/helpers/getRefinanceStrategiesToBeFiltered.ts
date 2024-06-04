import type { PositionFromUrlWithTriggers } from 'features/omni-kit/observables'
import type { ProductHubItem } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

/**
 * Strategies that should be filtered out from product hub.
 *
 * @remarks
 * while doing refinance, target strategy / position can't have automation enabled,
 * because it could lead to trigger being executed immediately
 *
 * @param events - position dpm events with trigger data
 * @param table - product hub table data
 * @returns filtered table data
 *
 * Aave / Spark
 * - we support only 1x Aave and 1x Spark position on single dpm
 * - if there is only Spark position, user should be able to pick any Aave strategy (the same other way around)
 * - if there is for example Spark position and Aave position on dpm, while doing refinance from Spark to Aave
 *   this Aave position should be used in refinance unless there is automation enabled (all other strategies should be filtered out)
 *
 * MorphoBlue
 * - single dpm can have multiple MorphoBlue positions, but on different markets
 * - each position can have automation enabled
 *
 * Maker
 * - no restrictions since we are using new (empty) dpm to do refinance, therefore all strategies are available
 *
 */
export const getRefinanceStrategiesToBeFiltered = ({
  events,
  table,
}: {
  events: PositionFromUrlWithTriggers[]
  table: ProductHubItem[]
}): ProductHubItem[] => {
  const mappedEvents = events.map((event) => ({
    protocol: event.protocol,
    collateralTokenSymbol: event.collateralTokenSymbol,
    debtTokenSymbol: event.debtTokenSymbol,
    pairId: event.pairId,
    triggers: event.triggers,
  }))
  return table.filter((item) => {
    const existingPosition = mappedEvents.find((event) => event.protocol === item.protocol)

    if (!existingPosition) {
      return true
    }

    switch (item.protocol) {
      case LendingProtocol.AaveV3:
      case LendingProtocol.SparkV3: {
        const flag = existingPosition.protocol
          .replace('aavev3', 'aave3')
          .replace('sparkv3', 'spark')

        const automations = existingPosition.triggers.flags[flag as 'aave3' | 'spark']
        const isAutomationEnabled = Object.values(automations).some((record) => record)

        if (isAutomationEnabled) {
          return false
        }

        return (
          item.primaryToken === existingPosition.collateralTokenSymbol &&
          item.secondaryToken === existingPosition.debtTokenSymbol
        )
      }
      case LendingProtocol.MorphoBlue:
        const pairId = Number(item.label.split('-')[1] || 1)

        return pairId !== existingPosition.pairId
      default:
        return true
    }
  })
}
