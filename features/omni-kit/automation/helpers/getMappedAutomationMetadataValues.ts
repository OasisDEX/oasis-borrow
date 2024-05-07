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

interface GetMappedAutomationMetadataValuesParams {
  automationForms: ProductContextAutomationForms
  commonFormState: OmniAutomationFormState
  hash: string
  poolId?: string
  positionTriggers: GetTriggersResponse
  simulationResponse?: OmniAutomationSimulationResponse
}

export const getMappedAutomationMetadataValues = ({
  automationForms,
  commonFormState,
  hash,
  poolId,
  positionTriggers: {  flags, triggers },
  simulationResponse,
}: GetMappedAutomationMetadataValuesParams) => {
  return {
    flags: {
      isStopLossEnabled: Object.keys(flags).some(
        (key) => flags[key as keyof typeof flags].isStopLossEnabled,
      ),
      isTrailingStopLossEnabled: Object.keys(flags).some(
        (key) => flags[key as keyof typeof flags].isTrailingStopLossEnabled,
      ),
      isAutoSellEnabled: Object.keys(flags).some(
        (key) => flags[key as keyof typeof flags].isBasicSellEnabled,
      ),
      isAutoBuyEnabled: Object.keys(flags).some(
        (key) => flags[key as keyof typeof flags].isBasicBuyEnabled,
      ),
      isPartialTakeProfitEnabled: Object.keys(flags).some(
        (key) => flags[key as keyof typeof flags].isPartialTakeProfitEnabled,
      ),
    },
    triggers: {
      stopLoss: mapStopLossTriggers(
        triggers.aave3.stopLossToCollateral ||
          triggers.aave3.stopLossToCollateralDMA ||
          triggers.aave3.stopLossToDebt ||
          triggers.aave3.stopLossToDebtDMA ||
          triggers.spark.stopLossToCollateral ||
          triggers.spark.stopLossToCollateralDMA ||
          triggers.spark.stopLossToDebt ||
          triggers.spark.stopLossToDebtDMA ||
          triggers[`morphoblue-${poolId}`]?.stopLoss,
      ),
      trailingStopLoss: mapTrailingStopLossTriggers(
        triggers.aave3.trailingStopLossDMA ||
          triggers.spark.trailingStopLossDMA ||
          triggers[`morphoblue-${poolId}`]?.trailingStopLoss,
      ),
      autoSell: mapAutoSellTriggers(
        triggers.aave3.basicSell ||
          triggers.spark.basicSell ||
          triggers[`morphoblue-${poolId}`]?.basicSell,
      ),
      autoBuy: mapAutoBuyTriggers(
        triggers.aave3.basicBuy ||
          triggers.spark.basicBuy ||
          triggers[`morphoblue-${poolId}`]?.basicBuy,
      ),
      partialTakeProfit: mapPartialTakeProfitTriggers(
        triggers.aave3.partialTakeProfit ||
          triggers.spark.partialTakeProfit ||
          triggers[`morphoblue-${poolId}`]?.partialTakeProfit,
      ),
    },
    simulation: simulationResponse?.simulation,
    ...getAutomationMetadataValues({ commonFormState, automationForms, hash }),
  }
}
