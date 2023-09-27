import BigNumber from 'bignumber.js'

export function calculateCollRatioFromMultiple(multiplier: number) {
  return new BigNumber(multiplier / (multiplier - 1))
    .decimalPlaces(2, BigNumber.ROUND_DOWN)
    .times(100)
}
