import {
  getAutomationMetadataValues,
  mapAutoBuyTriggers,
  mapAutoSellTriggers,
  mapPartialTakeProfitTriggers,
  mapStopLossTriggers,
  mapTrailingStopLossTriggers,
} from 'features/omni-kit/automation/helpers'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation/common'
import type {
  OmniAutomationSimulationResponse,
  ProductContextAutomationForms,
} from 'features/omni-kit/types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'

interface GetAaveLikeAutomationMetadataValuesParams {
  automationForms: ProductContextAutomationForms
  commonFormState: OmniAutomationFormState
  hash: string
  positionTriggers: GetTriggersResponse
  simulationResponse?: OmniAutomationSimulationResponse
}

export const getAaveLikeAutomationMetadataCommonValues = ({
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
        positionTriggers.triggers.aaveStopLossToDebtDMA ||
        positionTriggers.triggers.sparkStopLossToCollateral ||
        positionTriggers.triggers.sparkStopLossToCollateralDMA ||
        positionTriggers.triggers.sparkStopLossToDebt ||
        positionTriggers.triggers.sparkStopLossToDebtDMA
      ),
      isTrailingStopLossEnabled: !!(
        positionTriggers.triggers.aaveTrailingStopLossDMA ||
        positionTriggers.triggers.sparkTrailingStopLossDMA
      ),
      isAutoSellEnabled: !!(
        positionTriggers.flags.isAaveBasicSellEnabled ||
        positionTriggers.flags.isSparkBasicSellEnabled
      ),
      isAutoBuyEnabled: !!(
        positionTriggers.flags.isAaveBasicBuyEnabled ||
        positionTriggers.flags.isSparkBasicBuyEnabled
      ),
      isPartialTakeProfitEnabled: !!(
        positionTriggers.flags.isAavePartialTakeProfitEnabled ||
        positionTriggers.flags.isSparkPartialTakeProfitEnabled
      ),
    },
    triggers: {
      stopLoss: mapStopLossTriggers(
        positionTriggers.triggers.aaveStopLossToCollateral ||
          positionTriggers.triggers.aaveStopLossToCollateralDMA ||
          positionTriggers.triggers.aaveStopLossToDebt ||
          positionTriggers.triggers.aaveStopLossToDebtDMA ||
          positionTriggers.triggers.sparkStopLossToCollateral ||
          positionTriggers.triggers.sparkStopLossToCollateralDMA ||
          positionTriggers.triggers.sparkStopLossToDebt ||
          positionTriggers.triggers.sparkStopLossToDebtDMA,
      ),
      trailingStopLoss: mapTrailingStopLossTriggers(
        positionTriggers.triggers.aaveTrailingStopLossDMA ||
          positionTriggers.triggers.sparkTrailingStopLossDMA,
      ),
      autoSell: mapAutoSellTriggers(
        positionTriggers.triggers.aaveBasicSell || positionTriggers.triggers.sparkBasicSell,
      ),
      autoBuy: mapAutoBuyTriggers(
        positionTriggers.triggers.aaveBasicBuy || positionTriggers.triggers.sparkBasicBuy,
      ),
      partialTakeProfit: mapPartialTakeProfitTriggers(
        positionTriggers.triggers.aavePartialTakeProfit ||
          positionTriggers.triggers.sparkPartialTakeProfit,
      ),
    },
    simulation: simulationResponse?.simulation,
  }
}

export const getAaveLikeAutomationMetadataValues = ({
  automationForms,
  commonFormState,
  hash,
  positionTriggers,
  simulationResponse,
}: GetAaveLikeAutomationMetadataValuesParams) => {
  return {
    ...getAaveLikeAutomationMetadataCommonValues({ positionTriggers, simulationResponse }),
    ...getAutomationMetadataValues({ commonFormState, automationForms, hash }),
  }
}
