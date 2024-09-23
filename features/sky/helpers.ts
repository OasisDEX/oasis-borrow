import type BigNumber from 'bignumber.js'

export const showAllowanceInfo = (amount?: BigNumber, allowance?: BigNumber) =>
  amount && allowance && !allowance.isNaN() && (allowance.isZero() || allowance.isLessThan(amount))
