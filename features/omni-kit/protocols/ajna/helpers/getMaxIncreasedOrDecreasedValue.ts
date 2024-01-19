import type BigNumber from 'bignumber.js'

const FEE_FRACTION = 0.05
export const INCREASED_VALUE_PRECISSION = 8

export enum MaxValueResolverMode {
  DECREASED = 'decreased',
  INCREASED = 'increased',
}

const modeMap: {
  [MaxValueResolverMode.DECREASED]: 'minus'
  [MaxValueResolverMode.INCREASED]: 'plus'
} = {
  [MaxValueResolverMode.DECREASED]: 'minus',
  [MaxValueResolverMode.INCREASED]: 'plus',
}

export function getMaxIncreasedOrDecreasedValue(
  value: BigNumber,
  fee: BigNumber,
  mode: MaxValueResolverMode = MaxValueResolverMode.INCREASED,
) {
  return value[modeMap[mode]](value.times(fee.times(FEE_FRACTION))).dp(INCREASED_VALUE_PRECISSION)
}
