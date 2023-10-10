import type BigNumber from 'bignumber.js'

export const convertSliderValuesToPercents = (value: BigNumber, min: BigNumber, max: BigNumber) => {
  return value.minus(min).div(max.minus(min)).times(100).toNumber()
}
