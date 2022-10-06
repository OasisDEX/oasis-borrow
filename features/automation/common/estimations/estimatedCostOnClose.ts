import BigNumber from 'bignumber.js'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { one } from 'helpers/zero'

export function getEstimatedCostOnClose({
  toCollateral,
  marketPrice,
  lockedCollateral,
  debt,
  debtOffset,
}: {
  toCollateral: boolean
  marketPrice: BigNumber
  lockedCollateral: BigNumber
  debt: BigNumber
  debtOffset: BigNumber
}) {
  const currentDebt = debt.plus(debtOffset)
  const toTokenAmount = lockedCollateral.times(marketPrice).times(one.minus(OAZO_FEE))
  const requiredAmount = currentDebt
    .times(1.00001 /* to account for not up to date value here */)
    .times(one.plus(OAZO_FEE))
    .times(one.plus(LOAN_FEE))

  const oasisFee = toCollateral ? requiredAmount.times(OAZO_FEE) : lockedCollateral.times(marketPrice).minus(toTokenAmount)
  const loanFee = toCollateral ? requiredAmount.times(LOAN_FEE) : currentDebt.times(LOAN_FEE)

  const estimatedOasisFee = oasisFee.plus(loanFee)
  const estimatedGasFee = new BigNumber(1)

  return {
    estimatedOasisFee,
    estimatedGasFee,
    totalTransactionCost: estimatedOasisFee.plus(estimatedGasFee),
  }
}
