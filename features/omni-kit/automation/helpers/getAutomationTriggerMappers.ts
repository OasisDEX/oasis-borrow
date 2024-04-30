import BigNumber from 'bignumber.js'
import { lambdaPriceDenomination } from 'features/aave/constants'
import { maxUint256 } from 'features/automation/common/consts'
import type {
  AutoBuyTriggers,
  AutoBuyTriggersWithDecodedParams,
  AutoSellTriggers,
  AutoSellTriggersWithDecodedParams,
  PartialTakeProfitTriggers,
  PartialTakeProfitTriggersWithDecodedParams,
  StopLossTriggers,
  StopLossTriggersWithDecodedParams,
  TrailingStopLossTriggers,
  TrailingStopLossTriggersWithDecodedParams,
} from 'helpers/lambda/triggers'

export const mapStopLossTriggers = (
  triggers?: StopLossTriggers,
): StopLossTriggersWithDecodedParams | undefined => {
  if (!triggers) return undefined

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

export const mapTrailingStopLossTriggers = (
  triggers?: TrailingStopLossTriggers,
): TrailingStopLossTriggersWithDecodedParams | undefined => {
  if (!triggers) return undefined

  return {
    ...triggers,
    decodedMappedParams: {
      trailingDistance: new BigNumber(triggers.decodedParams.trailingDistance).div(10000),
    },
  }
}

export const mapAutoSellTriggers = (
  triggers?: AutoSellTriggers,
): AutoSellTriggersWithDecodedParams | undefined => {
  if (!triggers) return undefined

  const rawMinSellPrice = new BigNumber(triggers.decodedParams.minSellPrice)
  const minSellPrice = rawMinSellPrice.isEqualTo(maxUint256)
    ? undefined
    : rawMinSellPrice.div(lambdaPriceDenomination)

  return {
    ...triggers,
    decodedMappedParams: {
      minSellPrice,
      executionLtv: new BigNumber(triggers.decodedParams.executionLtv).div(10000),
      targetLtv: new BigNumber(triggers.decodedParams.targetLtv).div(10000),
      maxBaseFeeInGwei: new BigNumber(triggers.decodedParams.maxBaseFeeInGwei),
    },
  }
}

export const mapAutoBuyTriggers = (
  triggers?: AutoBuyTriggers,
): AutoBuyTriggersWithDecodedParams | undefined => {
  if (!triggers) return undefined

  const rawMaxBuyPrice = new BigNumber(triggers.decodedParams.maxBuyPrice)
  const maxBuyPrice = rawMaxBuyPrice.isEqualTo(maxUint256)
    ? undefined
    : rawMaxBuyPrice.div(lambdaPriceDenomination)

  return {
    ...triggers,
    decodedMappedParams: {
      maxBuyPrice,
      executionLtv: new BigNumber(triggers.decodedParams.executionLtv).div(10000),
      targetLtv: new BigNumber(triggers.decodedParams.targetLtv).div(10000),
      maxBaseFeeInGwei: new BigNumber(triggers.decodedParams.maxBaseFeeInGwei),
    },
  }
}

export const mapPartialTakeProfitTriggers = (
  triggers?: PartialTakeProfitTriggers,
): PartialTakeProfitTriggersWithDecodedParams | undefined => {
  if (!triggers) return undefined

  return {
    ...triggers,
    decodedMappedParams: {
      executionLtv: new BigNumber(triggers.decodedParams.executionLtv).div(10000),
      executionPrice: new BigNumber(triggers.decodedParams.executionPrice).div(
        lambdaPriceDenomination,
      ),
      ltvStep: new BigNumber(triggers.decodedParams.targetLtv).div(10000),
    },
  }
}
