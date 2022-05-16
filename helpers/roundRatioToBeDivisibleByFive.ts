import { BigNumber } from 'bignumber.js'

export function roundRatioToBeDivisibleByFive(toRound: BigNumber, type: BigNumber.RoundingMode) {
  return toRound.times(100).div(5).integerValue(type).times(5).div(100)
}
