import type { OmniAutomationSimulationResponse } from 'features/omni-kit/contexts'
import type { GetTriggersResponse } from 'helpers/triggers'

export const getAaveLikeAutomationMetadataValues = ({
  positionTriggers,
  simulationResponse,
}: {
  positionTriggers: GetTriggersResponse
  simulationResponse?: OmniAutomationSimulationResponse
}) => {
  return {
    flags: {
      isStopLossEnabled: !!(
        positionTriggers.triggers.aaveStopLossToCollateral ||
        positionTriggers.triggers.aaveStopLossToCollateralDMA ||
        positionTriggers.triggers.aaveStopLossToDebt ||
        positionTriggers.triggers.aaveStopLossToDebtDMA
      ),
      isTrailingStopLossEnabled: !!positionTriggers.triggers.aaveTrailingStopLossDMA,
      isAutoSellEnabled: positionTriggers.flags.isAaveBasicSellEnabled,
      isAutoBuyEnabled: positionTriggers.flags.isAaveBasicBuyEnabled,
      isPartialTakeProfitEnabled: positionTriggers.flags.isAavePartialTakeProfitEnabled,
    },
    triggers: {
      stopLoss:
        positionTriggers.triggers.aaveStopLossToCollateral ||
        positionTriggers.triggers.aaveStopLossToCollateralDMA ||
        positionTriggers.triggers.aaveStopLossToDebt ||
        positionTriggers.triggers.aaveStopLossToDebtDMA,
      trailingStopLoss: positionTriggers.triggers.aaveTrailingStopLossDMA,
      autoSell: positionTriggers.triggers.aaveBasicSell,
      autoBuy: positionTriggers.triggers.aaveBasicBuy,
      partialTakeProfit: positionTriggers.triggers.aavePartialTakeProfit,
    },
    simulation: simulationResponse?.simulation,
  }
}
