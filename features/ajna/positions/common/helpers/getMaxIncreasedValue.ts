import type BigNumber from 'bignumber.js'

const FEE_FRACTION = 0.05
const INCREASED_VALUE_PRECISSION = 6

export function getMaxIncreasedValue(value: BigNumber, fee: BigNumber) {
  return value.plus(value.times(fee.times(FEE_FRACTION))).dp(INCREASED_VALUE_PRECISSION)
}
