import type BigNumber from 'bignumber.js'
import type { IStrategyConfig } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import { formatAmount } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'

export const getFormattedPrice = (price: BigNumber, strategyConfig: IStrategyConfig) => {
  const basedOnStrategyPrice =
    strategyConfig.strategyType === StrategyType.Short
      ? price.isZero()
        ? zero
        : one.div(price)
      : price
  const denominationToken =
    strategyConfig.strategyType === StrategyType.Short
      ? strategyConfig.tokens.collateral
      : strategyConfig.tokens.debt
  const denomination =
    strategyConfig.strategyType === StrategyType.Short
      ? `${strategyConfig.tokens.debt}/${strategyConfig.tokens.collateral}`
      : `${strategyConfig.tokens.collateral}/${strategyConfig.tokens.debt}`

  return `${formatAmount(basedOnStrategyPrice, denominationToken)} ${denomination}`
}
