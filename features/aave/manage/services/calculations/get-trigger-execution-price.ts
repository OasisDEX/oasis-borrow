import type BigNumber from 'bignumber.js'
import type { AutoBuyTriggerAaveContext, PositionLike } from 'features/aave/manage/state'
import { one } from 'helpers/zero'

export interface ExecutionPrice {
  price: BigNumber
  denomination: string
}

export const getDenomination = (position: PositionLike) => {
  return position.pricesDenomination === 'debt'
    ? `${position.debt.token.symbol}/${position.collateral.token.symbol}`
    : `${position.collateral.token.symbol}/${position.debt.token.symbol}`
}

export const getTriggerExecutionPrice = ({
  position,
  executionTriggerLTV,
}: Pick<AutoBuyTriggerAaveContext, 'position' | 'executionTriggerLTV'>) => {
  if (!position || !executionTriggerLTV) {
    return undefined
  }

  const debtToCollateralRatio = position.debt.amount.div(
    position.collateral.amount.times(executionTriggerLTV / 100),
  )

  if (position.pricesDenomination === 'debt') {
    return {
      price: one.div(debtToCollateralRatio),
      denomination: getDenomination(position),
    }
  }

  return {
    price: debtToCollateralRatio,
    denomination: getDenomination(position),
  }
}
