import { BigNumber } from 'bignumber.js'

export function compareBigNumber(a: BigNumber | undefined, b: BigNumber | undefined) {
  if (a === undefined && b === undefined) {
    return 0
  }
  if (a === undefined) {
    return -1
  }
  if (b === undefined) {
    return 1
  }

  return a.comparedTo(b)
}
