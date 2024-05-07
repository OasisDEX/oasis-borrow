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
    case LendingProtocol.AaveV3:
      const {
        aaveStopLossToCollateral,
        aaveStopLossToDebt,
        aaveBasicSell,
        aaveStopLossToCollateralDMA,
        aaveStopLossToDebtDMA,
        aaveTrailingStopLossDMA,
      } = triggers.aave3

      return isAnyValueDefined(
        aaveStopLossToCollateral,
        aaveStopLossToDebt,
        aaveBasicSell,
        aaveStopLossToCollateralDMA,
        aaveStopLossToDebtDMA,
        aaveTrailingStopLossDMA,
      )
    case LendingProtocol.MorphoBlue:
      if (`morphoblue-${poolId}` in triggers) {
        const { morphoBlueBasicSell, morphoBlueStopLoss, morphoBlueTrailingStopLoss } =
          triggers[`morphoblue-${poolId}`]

        return isAnyValueDefined(
          morphoBlueBasicSell,
          morphoBlueStopLoss,
          morphoBlueTrailingStopLoss,
        )
      } else return false
    case LendingProtocol.SparkV3:
      const {
        sparkBasicSell,
        sparkStopLossToCollateral,
        sparkStopLossToDebt,
        sparkStopLossToCollateralDMA,
        sparkStopLossToDebtDMA,
        sparkTrailingStopLossDMA,
      } = triggers.spark

      return isAnyValueDefined(
        sparkBasicSell,
        sparkStopLossToCollateral,
        sparkStopLossToDebt,
        sparkStopLossToCollateralDMA,
        sparkStopLossToDebtDMA,
        sparkTrailingStopLossDMA,
      )
    default:
      return false
  }
}
