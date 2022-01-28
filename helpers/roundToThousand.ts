import { BigNumber } from 'bignumber.js'

type RoundingMode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export function roundToThousand(value: BigNumber, roundingMode: RoundingMode = 3) {
  return new BigNumber(value.div(1000).toFixed(0, roundingMode)).multipliedBy(1000)
}
