import { isAnyValueDefined } from 'helpers/isAnyValueDefined'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

interface HasActiveProtectionParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  protocol: LendingProtocol
}

export const hasActiveProtection = ({
  poolId,
  positionTriggers: { triggers },
  protocol,
}: HasActiveProtectionParams): boolean => {
  switch (protocol) {
    case LendingProtocol.Maker: {
      const { basicSell, stopLossToCollateral, stopLossToDebt } = triggers.maker

      return isAnyValueDefined(basicSell, stopLossToCollateral, stopLossToDebt)
    }
    case LendingProtocol.AaveV3: {
      const {
        basicSell,
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
        trailingStopLossDMA,
      } = triggers.aave3

      return isAnyValueDefined(
        basicSell,
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
        trailingStopLossDMA,
      )
    }
    case LendingProtocol.MorphoBlue: {
      if (`morphoblue-${poolId}` in triggers) {
        const { basicSell, stopLoss, trailingStopLoss } = triggers[`morphoblue-${poolId}`]

        return isAnyValueDefined(basicSell, stopLoss, trailingStopLoss)
      } else return false
    }
    case LendingProtocol.SparkV3: {
      const {
        basicSell,
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
        trailingStopLossDMA,
      } = triggers.spark

      return isAnyValueDefined(
        basicSell,
        stopLossToCollateral,
        stopLossToCollateralDMA,
        stopLossToDebt,
        stopLossToDebtDMA,
        trailingStopLossDMA,
      )
    }
    default:
      return false
  }
}
