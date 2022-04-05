import { BigNumber } from 'bignumber.js'

export function roundRatioToBeDivisibleByFive(toRandom: BigNumber, type: BigNumber.RoundingMode) {
  return toRandom.times(100).div(5).integerValue(type).times(5).div(100)
}
