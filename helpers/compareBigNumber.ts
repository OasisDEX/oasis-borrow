import BigNumber from 'bignumber.js'

export function compareBigNumber(a: BigNumber | undefined, b: BigNumber | undefined) {
  if (a === undefined && b === undefined) {
    return true
  }

  if (a === undefined || b === undefined) {
    return false
  }

  return a.eq(b)
}
