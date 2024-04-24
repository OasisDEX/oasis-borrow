import { isAnyValueDefined } from 'helpers/isAnyValueDefined'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

export const hasActiveOptimization = (
  positionTriggers: GetTriggersResponse,
  protocol: LendingProtocol,
): boolean => {
  const { aaveBasicBuy, aavePartialTakeProfit, sparkBasicBuy, sparkPartialTakeProfit } =
    positionTriggers.triggers
  switch (protocol) {
    case LendingProtocol.AaveV3:
      return isAnyValueDefined(aaveBasicBuy, aavePartialTakeProfit)
    case LendingProtocol.SparkV3:
      return isAnyValueDefined(sparkBasicBuy, sparkPartialTakeProfit)
    default:
      return false
  }
}
