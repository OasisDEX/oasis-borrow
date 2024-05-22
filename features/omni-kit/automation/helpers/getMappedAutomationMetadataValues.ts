import {
  mapAutoBuyTriggers,
  mapAutoSellTriggers,
  mapPartialTakeProfitTriggers,
  mapStopLossTriggers,
  mapTrailingStopLossTriggers,
} from 'features/omni-kit/automation/helpers'
import type { OmniAutomationSimulationResponse } from 'features/omni-kit/types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import type { LendingProtocol } from 'lendingProtocols'

interface GetMappedAutomationMetadataValuesParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  simulationResponse?: OmniAutomationSimulationResponse
  protocol: LendingProtocol
}

export const getMappedAutomationMetadataValues = ({
  poolId,
  positionTriggers: { flags, triggers },
  simulationResponse,
  protocol,
}: GetMappedAutomationMetadataValuesParams) => {
  const flagSelector = (
    poolId
      ? `${protocol}-${poolId}`
      : protocol.replace('aavev3', 'aave3').replace('sparkv3', 'spark')
  ) as keyof typeof flags // thanks for "aave3" and "spark"... 🙄

  const selectedFlags = flags[flagSelector]
  return {
    flags: {
      isStopLossEnabled: selectedFlags?.isStopLossEnabled,
      isTrailingStopLossEnabled: selectedFlags?.isTrailingStopLossEnabled,
      isAutoSellEnabled: selectedFlags?.isBasicSellEnabled,
      isAutoBuyEnabled: selectedFlags?.isBasicBuyEnabled,
      isPartialTakeProfitEnabled: selectedFlags?.isPartialTakeProfitEnabled,
    },
    triggers: {
      stopLoss: mapStopLossTriggers(
        poolId
          ? triggers[`morphoblue-${poolId}`]?.stopLoss
          : triggers.aave3.stopLossToCollateral ||
              triggers.aave3.stopLossToCollateralDMA ||
              triggers.aave3.stopLossToDebt ||
              triggers.aave3.stopLossToDebtDMA ||
              triggers.spark.stopLossToCollateral ||
              triggers.spark.stopLossToCollateralDMA ||
              triggers.spark.stopLossToDebt ||
              triggers.spark.stopLossToDebtDMA,
      ),
      trailingStopLoss: mapTrailingStopLossTriggers(
        poolId
          ? triggers[`morphoblue-${poolId}`]?.trailingStopLoss
          : triggers.aave3.trailingStopLossDMA || triggers.spark.trailingStopLossDMA,
      ),
      autoSell: mapAutoSellTriggers(
        poolId
          ? triggers[`morphoblue-${poolId}`]?.basicSell
          : triggers.aave3.basicSell || triggers.spark.basicSell,
      ),
      autoBuy: mapAutoBuyTriggers(
        poolId
          ? triggers[`morphoblue-${poolId}`]?.basicBuy
          : triggers.aave3.basicBuy || triggers.spark.basicBuy,
      ),
      partialTakeProfit: mapPartialTakeProfitTriggers(
        poolId
          ? triggers[`morphoblue-${poolId}`]?.partialTakeProfit
          : triggers.aave3.partialTakeProfit || triggers.spark.partialTakeProfit,
      ),
    },
    simulation: simulationResponse?.simulation,
  }
}
