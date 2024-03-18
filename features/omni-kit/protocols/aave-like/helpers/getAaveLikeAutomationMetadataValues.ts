import BigNumber from 'bignumber.js'
import { lambdaPriceDenomination } from 'features/aave/constants'
import type { OmniAutomationSimulationResponse } from 'features/omni-kit/contexts'
import type {
  AutoBuyTriggers,
  AutoBuyTriggersWithDecodedParams,
  AutoSellTriggers,
  AutoSellTriggersWithDecodedParams,
  GetTriggersResponse,
  PartialTakeProfitTriggers,
  PartialTakeProfitTriggersWithDecodedParams,
  StopLossTriggers,
  StopLossTriggersWithDecodedParams,
  TrailingStopLossTriggers,
  TrailingStopLossTriggersWithDecodedParams,
} from 'helpers/triggers'

const mapStopLossTriggers = (
  triggers?: StopLossTriggers,
): StopLossTriggersWithDecodedParams | undefined => {
  if (!triggers) {
    return undefined
  }

  return {
    ...triggers,
    decodedMappedParams: {
      ...(triggers.decodedParams.executionLtv && {
        executionLtv: new BigNumber(triggers.decodedParams.executionLtv).div(10000),
      }),
      ...(triggers.decodedParams.ltv && {
        ltv: new BigNumber(triggers.decodedParams.ltv).div(10000),
      }),
    },
  }
}

const mapTrailingStopLossTriggers = (
  triggers?: TrailingStopLossTriggers,
): TrailingStopLossTriggersWithDecodedParams | undefined => {
  if (!triggers) {
    return undefined
  }

  return {
    ...triggers,
    decodedMappedParams: {
      trailingDistance: new BigNumber(triggers.decodedParams.trailingDistance).div(10000),
    },
  }
}

const mapAutoSellTriggers = (
  triggers?: AutoSellTriggers,
): AutoSellTriggersWithDecodedParams | undefined => {
  if (!triggers) {
    return undefined
  }

  return {
    ...triggers,
    decodedMappedParams: {
      minSellPrice: new BigNumber(triggers.decodedParams.minSellPrice).div(lambdaPriceDenomination),
      executionLtv: new BigNumber(triggers.decodedParams.executionLtv).div(10000),
      targetLtv: new BigNumber(triggers.decodedParams.targetLtv).div(10000),
      maxBaseFeeInGwei: new BigNumber(triggers.decodedParams.maxBaseFeeInGwei),
    },
  }
}

const mapAutoBuyTriggers = (
  triggers?: AutoBuyTriggers,
): AutoBuyTriggersWithDecodedParams | undefined => {
  if (!triggers) {
    return undefined
  }

  return {
    ...triggers,
    decodedMappedParams: {
      maxBuyPrice: new BigNumber(triggers.decodedParams.maxBuyPrice).div(lambdaPriceDenomination),
      executionLtv: new BigNumber(triggers.decodedParams.executionLtv).div(10000),
      targetLtv: new BigNumber(triggers.decodedParams.targetLtv).div(10000),
      maxBaseFeeInGwei: new BigNumber(triggers.decodedParams.maxBaseFeeInGwei),
    },
  }
}

const mapPartialTakeProfitTriggers = (
  triggers?: PartialTakeProfitTriggers,
): PartialTakeProfitTriggersWithDecodedParams | undefined => {
  if (!triggers) {
    return undefined
  }

  return {
    ...triggers,
    decodedMappedParams: {
      executionLtv: new BigNumber(triggers.decodedParams.executionLtv).div(10000),
      executionPrice: new BigNumber(triggers.decodedParams.executionPrice).div(
        lambdaPriceDenomination,
      ),
      targetLtv: new BigNumber(triggers.decodedParams.targetLtv).div(10000),
    },
  }
}

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
      stopLoss: mapStopLossTriggers(
        positionTriggers.triggers.aaveStopLossToCollateral ||
          positionTriggers.triggers.aaveStopLossToCollateralDMA ||
          positionTriggers.triggers.aaveStopLossToDebt ||
          positionTriggers.triggers.aaveStopLossToDebtDMA,
      ),
      trailingStopLoss: mapTrailingStopLossTriggers(
        positionTriggers.triggers.aaveTrailingStopLossDMA,
      ),
      autoSell: mapAutoSellTriggers(positionTriggers.triggers.aaveBasicSell),
      autoBuy: mapAutoBuyTriggers(positionTriggers.triggers.aaveBasicBuy),
      partialTakeProfit: mapPartialTakeProfitTriggers(
        positionTriggers.triggers.aavePartialTakeProfit,
      ),
    },
    simulation: simulationResponse?.simulation,
  }
}
