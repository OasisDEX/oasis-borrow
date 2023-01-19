import BigNumber from 'bignumber.js'

export function isLtvGreaterThanThreshold(ltv: BigNumber, threshold: BigNumber) {
  return ltv.gt(threshold)
}
