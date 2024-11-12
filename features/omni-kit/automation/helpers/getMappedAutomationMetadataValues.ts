import {
  mapAutoBuyTriggers,
  mapAutoSellTriggers,
  mapPartialTakeProfitTriggers,
  mapStopLossTriggers,
  mapTrailingStopLossTriggers,
} from 'features/omni-kit/automation/helpers'
import type { OmniAutomationSimulationResponse } from 'features/omni-kit/types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

interface GetMappedAutomationMetadataValuesParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  simulationResponse?: OmniAutomationSimulationResponse
  protocol: LendingProtocol
}

type MorphoBlueFlag = `morphoblue-${string}`
type AaveLikeFlag = 'aave3' | 'spark'

const morphoBlueFlagGuard = (flag: MorphoBlueFlag | AaveLikeFlag): flag is MorphoBlueFlag =>
  flag.includes('morphoblue')

const aaveLikeFlagGuard = (flag: MorphoBlueFlag | AaveLikeFlag): flag is AaveLikeFlag =>
  flag.includes('aave3') || flag.includes('spark')

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

  const resolvedFlags = {
    isStopLossEnabled: selectedFlags?.isStopLossEnabled,
    isTrailingStopLossEnabled: selectedFlags?.isTrailingStopLossEnabled,
    isAutoSellEnabled: selectedFlags?.isBasicSellEnabled,
    isAutoBuyEnabled: selectedFlags?.isBasicBuyEnabled,
    isPartialTakeProfitEnabled: selectedFlags?.isPartialTakeProfitEnabled,
  }

  switch (protocol) {
    case LendingProtocol.MorphoBlue:
      if (!morphoBlueFlagGuard(flagSelector)) {
        throw Error(`Wrong morpho flagSelector value ${flagSelector}`)
      }

      return {
        triggers: {
          stopLoss: mapStopLossTriggers(triggers[flagSelector]?.stopLoss),
          trailingStopLoss: mapTrailingStopLossTriggers(triggers[flagSelector]?.trailingStopLoss),
          autoSell: mapAutoSellTriggers(triggers[flagSelector]?.basicSell),
          autoBuy: mapAutoBuyTriggers(triggers[flagSelector]?.basicBuy),
          partialTakeProfit: mapPartialTakeProfitTriggers(
            triggers[flagSelector]?.partialTakeProfit,
          ),
        },
        flags: resolvedFlags,
        simulation: simulationResponse?.simulation,
      }
    case LendingProtocol.AaveV3:
    case LendingProtocol.SparkV3:
      if (!aaveLikeFlagGuard(flagSelector)) {
        throw Error(`Wrong aave-like flagSelector value ${flagSelector}`)
      }

      return {
        triggers: {
          stopLoss: mapStopLossTriggers(
            triggers[flagSelector].stopLossToCollateral ||
              triggers[flagSelector].stopLossToCollateralDMA ||
              triggers[flagSelector].stopLossToDebt ||
              triggers[flagSelector].stopLossToDebtDMA,
          ),
          trailingStopLoss: mapTrailingStopLossTriggers(triggers[flagSelector].trailingStopLossDMA),
          autoSell: mapAutoSellTriggers(triggers[flagSelector].basicSell),
          autoBuy: mapAutoBuyTriggers(triggers[flagSelector].basicBuy),
          partialTakeProfit: mapPartialTakeProfitTriggers(triggers[flagSelector].partialTakeProfit),
        },
        flags: resolvedFlags,
        simulation: simulationResponse?.simulation,
      }
    default:
      return {
        triggers: {
          stopLoss: undefined,
          trailingStopLoss: undefined,
          autoSell: undefined,
          autoBuy: undefined,
          partialTakeProfit: undefined,
        },
        flags: resolvedFlags,
        simulation: simulationResponse?.simulation,
      }
  }
}
