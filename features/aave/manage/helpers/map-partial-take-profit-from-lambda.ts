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
import { LendingProtocol } from 'lendingProtocols'

interface MapPartialTakeProfitFromLambdaParams {
  poolId?: string
  protocol: LendingProtocol
  strategyConfig: IStrategyConfig
  triggers?: GetTriggersResponse['triggers']
}

const getTrigger = ({ protocol, triggers, poolId }: MapPartialTakeProfitFromLambdaParams) => {
  if (!triggers) return undefined

  switch (protocol) {
    case LendingProtocol.AaveV3: {
      return triggers.aave3.partialTakeProfit
    }
    case LendingProtocol.MorphoBlue: {
      if (`morphoblue-${poolId}` in triggers)
        return triggers[`morphoblue-${poolId}`].partialTakeProfit
      else return undefined
    }
    case LendingProtocol.SparkV3: {
      return triggers.spark.partialTakeProfit
    }
    default:
      return undefined
  }
}

export const mapPartialTakeProfitFromLambda = ({
  poolId,
  protocol,
  strategyConfig,
  triggers,
}: MapPartialTakeProfitFromLambdaParams) => {
  if (!triggers) return {}

  const trigger = getTrigger({ poolId, protocol, strategyConfig, triggers })

  if (trigger) {
    const isShort = strategyConfig.strategyType === StrategyType.Short
    const hasStopLoss = hasActiveStopLossFromTriggers({ triggers, protocol })
    const hasTrailingStopLoss = hasActiveTrailingStopLossFromTriggers({ triggers, protocol })

    const currentStopLossLevel = mapStopLossFromLambda({ poolId, protocol, triggers }).stopLossLevel
    const trailingStopLossData = mapTrailingStopLossFromLambda({ poolId, protocol, triggers })

    const stopLossTokenLabel = isShort
      ? `${strategyConfig.tokens.debt}/${strategyConfig.tokens.collateral}`
      : `${strategyConfig.tokens.collateral}/${strategyConfig.tokens.debt}`

    const triggerLtv = new BigNumber(Number(trigger.decodedParams.executionLtv)).div(
      lambdaPercentageDenomination,
    )
    const startingTakeProfitPriceLong = new BigNumber(
      Number(trigger.decodedParams.executionPrice),
    ).div(lambdaPriceDenomination)
    const startingTakeProfitPriceShort = new BigNumber(lambdaPriceDenomination).div(
      new BigNumber(Number(trigger.decodedParams.executionPrice)),
    )
    const withdrawalLtv = new BigNumber(Number(trigger.decodedParams.targetLtv))
      .minus(new BigNumber(Number(trigger.decodedParams.executionLtv)))
      .div(lambdaPercentageDenomination)

    const partialTakeProfitToken =
      trigger.decodedParams.withdrawToDebt === 'true' ? ('debt' as const) : ('collateral' as const)

    return {
      triggerId: trigger.triggerId,
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
  } else return {}
}
