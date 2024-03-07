import type { GetTriggersResponse } from 'helpers/triggers'

export const hasActiveOptimization = (positionTriggers: GetTriggersResponse): boolean => {
  const hasAaveAutoBuyEnabled = positionTriggers.triggers.aaveBasicBuy !== undefined
  const hasSparkAutoBuyEnabled = positionTriggers.triggers.sparkBasicBuy !== undefined

  const hasAavePartialTakeProfitEnabled =
    positionTriggers.triggers.aavePartialTakeProfit !== undefined
  const hasSparkPartialTakeProfitEnabled =
    positionTriggers.triggers.sparkPartialTakeProfit !== undefined

  return (
    hasAaveAutoBuyEnabled ||
    hasSparkAutoBuyEnabled ||
    hasAavePartialTakeProfitEnabled ||
    hasSparkPartialTakeProfitEnabled
  )
}
