import { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import {
  hasActiveStopLossFromTriggers,
  hasActiveTrailingStopLossFromTriggers,
} from 'features/aave/manage/state'
import type { IStrategyConfig } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import { formatPercent } from 'helpers/formatters/format'
import type { GetTriggersResponse } from 'helpers/triggers'
import { zero } from 'helpers/zero'

export const mapPartialTakeProfitFromLambda = (
  strategyConfig: IStrategyConfig,
  triggers?: GetTriggersResponse['triggers'],
) => {
  if (!triggers) {
    return {}
  }
  const isShort = strategyConfig.strategyType === StrategyType.Short
  const hasStopLoss = hasActiveStopLossFromTriggers({ triggers, protocol: strategyConfig.protocol })
  const hasTrailingStopLoss = hasActiveTrailingStopLossFromTriggers({
    triggers,
    protocol: strategyConfig.protocol,
  })
  const stopLossData = mapStopLossFromLambda(triggers)
  const trailingStopLossData = mapTrailingStopLossFromLambda(triggers)
  const stopLossTokenLabel = isShort
    ? `${strategyConfig.tokens.debt}/${strategyConfig.tokens.collateral}`
    : `${strategyConfig.tokens.collateral}/${strategyConfig.tokens.debt}`
  return {
    hasStopLoss: hasStopLoss || hasTrailingStopLoss,
    stopLossLevelLabel: hasStopLoss ? `${formatPercent(stopLossData.stopLossLevel || zero)}` : '',
    trailingStopLossDistanceLabel: hasTrailingStopLoss
      ? `${trailingStopLossData.trailingDistance} ${stopLossTokenLabel}`
      : '',
  }
}
