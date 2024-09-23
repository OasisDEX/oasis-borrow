import type BigNumber from 'bignumber.js'

export const showAllowanceInfo = (amount?: BigNumber, allowance?: BigNumber): boolean => {
  if (!amount || !allowance || allowance.isNaN() || amount.isNaN() || amount.isZero()) {
    return false
  }

  return allowance.isZero() || allowance.isLessThan(amount)
}
