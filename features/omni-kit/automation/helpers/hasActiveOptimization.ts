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
    case LendingProtocol.Maker: {
      const { basicBuy, autoTakeProfitToCollateral, autoTakeProfitToDebt } = triggers.maker

      return isAnyValueDefined(basicBuy, autoTakeProfitToCollateral, autoTakeProfitToDebt)
    }
    case LendingProtocol.AaveV3: {
      const { basicBuy, partialTakeProfit } = triggers.aave3

      return isAnyValueDefined(basicBuy, partialTakeProfit)
    }
    case LendingProtocol.MorphoBlue: {
      if (`morphoblue-${poolId}` in triggers) {
        const { basicBuy, partialTakeProfit } = triggers[`morphoblue-${poolId}`]

        return isAnyValueDefined(basicBuy, partialTakeProfit)
      } else return false
    }
    case LendingProtocol.SparkV3: {
      const { basicBuy, partialTakeProfit } = triggers.spark

      return isAnyValueDefined(basicBuy, partialTakeProfit)
    }
    default:
      return false
  }
}
