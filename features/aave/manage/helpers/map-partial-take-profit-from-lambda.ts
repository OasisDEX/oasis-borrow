import BigNumber from 'bignumber.js'
import { lambdaPercentageDenomination, lambdaPriceDenomination } from 'features/aave/constants'
import { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import {
  hasActiveStopLossFromTriggers,
  hasActiveTrailingStopLossFromTriggers,
} from 'features/aave/manage/state'
import type { IStrategyConfig } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import { formatPercent } from 'helpers/formatters/format'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { nbsp } from 'helpers/nbsp'
import { useMemo } from 'react'

export const mapPartialTakeProfitFromLambda = (
  strategyConfig: IStrategyConfig,
  triggers?: GetTriggersResponse['triggers'],
) => {
  if (!triggers) {
    return {}
  }
  const isShort = strategyConfig.strategyType === StrategyType.Short

  const partialTakeProfitTriggersNames = Object.keys(triggers).filter((triggerName) =>
    triggerName.includes('PartialTakeProfit'),
  )
  if (partialTakeProfitTriggersNames.length > 1) {
    console.warn(
      'Warning: more than one partial take profit trigger found:',
      partialTakeProfitTriggersNames,
    )
  }
  const partialTakeProfitTriggerName = partialTakeProfitTriggersNames[0] as
    | 'sparkPartialTakeProfit'
    | 'aavePartialTakeProfit'
  const selectedTrigger = triggers[partialTakeProfitTriggerName]

  const hasStopLoss = hasActiveStopLossFromTriggers({ triggers, protocol: strategyConfig.protocol })
  const hasTrailingStopLoss = hasActiveTrailingStopLossFromTriggers({
    triggers,
    protocol: strategyConfig.protocol,
  })
  const currentStopLossLevel = useMemo(() => {
    return mapStopLossFromLambda(triggers).stopLossLevel
  }, [triggers])
  const trailingStopLossData = mapTrailingStopLossFromLambda(triggers)
  const stopLossTokenLabel = isShort
    ? `${strategyConfig.tokens.debt}/${strategyConfig.tokens.collateral}`
    : `${strategyConfig.tokens.collateral}/${strategyConfig.tokens.debt}`

  const triggerLtv = selectedTrigger?.decodedParams.executionLtv
    ? new BigNumber(Number(selectedTrigger.decodedParams.executionLtv)).div(
        lambdaPercentageDenomination,
      )
    : undefined
  const startingTakeProfitPriceLong = selectedTrigger?.decodedParams.executionPrice
    ? new BigNumber(Number(selectedTrigger.decodedParams.executionPrice)).div(
        lambdaPriceDenomination,
      )
    : undefined
  const startingTakeProfitPriceShort = selectedTrigger?.decodedParams.executionPrice
    ? new BigNumber(lambdaPriceDenomination).div(
        new BigNumber(Number(selectedTrigger.decodedParams.executionPrice)),
      )
    : undefined
  const withdrawalLtv =
    selectedTrigger?.decodedParams.targetLtv && selectedTrigger?.decodedParams.executionLtv
      ? new BigNumber(Number(selectedTrigger.decodedParams.targetLtv))
          .minus(new BigNumber(Number(selectedTrigger?.decodedParams.executionLtv)))
          .div(lambdaPercentageDenomination)
      : undefined
  const partialTakeProfitToken =
    selectedTrigger?.decodedParams.withdrawToDebt === 'true'
      ? ('debt' as const)
      : ('collateral' as const)

  return {
    triggerId: selectedTrigger?.triggerId,
    triggerLtv,
    startingTakeProfitPrice: isShort ? startingTakeProfitPriceShort : startingTakeProfitPriceLong,
    withdrawalLtv,
    partialTakeProfitToken,
    hasStopLoss: hasStopLoss || hasTrailingStopLoss,
    currentStopLossLevel,
    currentTrailingDistance: trailingStopLossData.trailingDistance,
    stopLossLevelLabel:
      hasStopLoss && currentStopLossLevel ? `${formatPercent(currentStopLossLevel)}` : '',
    trailingStopLossDistanceLabel: hasTrailingStopLoss
      ? `${trailingStopLossData.trailingDistance}${nbsp}${stopLossTokenLabel}`
      : '',
  }
}
