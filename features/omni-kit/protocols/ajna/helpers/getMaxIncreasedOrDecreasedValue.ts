import type BigNumber from 'bignumber.js'

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

export function getMaxIncreasedOrDecreasedValue({
  value,
  apy,
  precision,
  mode = MaxValueResolverMode.INCREASED,
}: {
  value: BigNumber
  apy: BigNumber
  precision: number
  mode?: MaxValueResolverMode
}) {
  // simplified 5 days apy to calculate offset from given value
  return value[modeMap[mode]](value.times(apy.div(365).times(5))).dp(precision)
}
