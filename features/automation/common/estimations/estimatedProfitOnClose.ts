import BigNumber from 'bignumber.js'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { one } from 'helpers/zero'

export function getEstimatedProfitOnClose({
  colMarketPrice,
  debt,
  debtOffset,
  lockedCollateral,
  slippage,
  toCollateral,
}: {
  colMarketPrice: BigNumber
  debt: BigNumber
  debtOffset: BigNumber
  lockedCollateral: BigNumber
  slippage: BigNumber
  toCollateral: boolean
}) {
  const currentDebt = debt.plus(debtOffset)
  const toTokenAmount = lockedCollateral.times(colMarketPrice).times(one.minus(OAZO_FEE))
  const requiredAmount = currentDebt.times(one.plus(OAZO_FEE)).times(one.plus(LOAN_FEE))
  const minToTokenAmount = toTokenAmount.times(one.minus(slippage))
  const maxCollNeeded = requiredAmount.div(colMarketPrice.times(one.minus(slippage)))

  return toCollateral ? lockedCollateral.minus(maxCollNeeded) : minToTokenAmount.minus(debt)
}
