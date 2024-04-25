import { isAnyValueDefined } from 'helpers/isAnyValueDefined'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

export const hasActiveProtection = (
  positionTriggers: GetTriggersResponse,
  protocol: LendingProtocol,
): boolean => {
  const {
    aaveStopLossToCollateral,
    sparkStopLossToCollateral,
    aaveStopLossToCollateralDMA,
    aaveStopLossToDebtDMA,
    sparkStopLossToCollateralDMA,
    sparkStopLossToDebtDMA,
    sparkStopLossToDebt,
    aaveStopLossToDebt,
    aaveBasicSell,
    sparkBasicSell,
    aaveTrailingStopLossDMA,
    sparkTrailingStopLossDMA,
  } = positionTriggers.triggers

  switch (protocol) {
    case LendingProtocol.AaveV3:
      return isAnyValueDefined(
        aaveStopLossToCollateral,
        aaveStopLossToDebt,
        aaveBasicSell,
        aaveStopLossToCollateralDMA,
        aaveStopLossToDebtDMA,
        aaveTrailingStopLossDMA,
      )
    case LendingProtocol.SparkV3:
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
