import type BigNumber from 'bignumber.js'
import type { IStrategyConfig } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import { formatAmount } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'

export const getDenominations = (strategy: IStrategyConfig) => {
  const denominationToken =
    strategy.strategyType === StrategyType.Short ? strategy.tokens.collateral : strategy.tokens.debt
  const denomination =
    strategy.strategyType === StrategyType.Short
      ? `${strategy.tokens.debt}/${strategy.tokens.collateral}`
      : `${strategy.tokens.collateral}/${strategy.tokens.debt}`
  return { denominationToken, denomination }
}
export const getFormattedPrice = (price: BigNumber, strategyConfig: IStrategyConfig) => {
  const { denominationToken, denomination } = getDenominations(strategyConfig)
  const basedOnStrategyPrice =
    strategyConfig.strategyType === StrategyType.Short
      ? price.isZero()
        ? zero
        : one.div(price)
      : price

  return `${formatAmount(basedOnStrategyPrice, denominationToken)} ${denomination}`
}
