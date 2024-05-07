import { isAnyValueDefined } from 'helpers/isAnyValueDefined'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

interface HasActiveOptimizationParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  protocol: LendingProtocol
}

export const hasActiveOptimization = ({
  poolId,
  positionTriggers: { triggers },
  protocol,
}: HasActiveOptimizationParams): boolean => {
  switch (protocol) {
    case LendingProtocol.AaveV3:
      const { aaveBasicBuy, aavePartialTakeProfit } = triggers.aave3

      return isAnyValueDefined(aaveBasicBuy, aavePartialTakeProfit)
    case LendingProtocol.MorphoBlue:
      if (`morphoblue-${poolId}` in triggers) {
        const { morphoBlueBasicBuy, morphoBluePartialTakeProfit } = triggers[`morphoblue-${poolId}`]

        return isAnyValueDefined(morphoBlueBasicBuy, morphoBluePartialTakeProfit)
      } else return false
    case LendingProtocol.SparkV3:
      const { sparkBasicBuy, sparkPartialTakeProfit } = triggers.spark

      return isAnyValueDefined(sparkBasicBuy, sparkPartialTakeProfit)
    default:
      return false
  }
}
