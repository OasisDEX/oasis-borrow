import BigNumber from 'bignumber.js'

// safe defaults which should ensure reasonable slider range for newly created pools
export const ajnaDefaultPoolRangeMarketPriceOffset = 0.99 // 99%

export const LTVWarningThreshold = new BigNumber(0.05)
export const LUPPercentageOffset = new BigNumber(0.05)

export const AJNA_LUP_OFFSET = 0.06 // 6%
export const AJNA_HTP_OFFSET = 0.02 // 2%

export const ajnaLastIndexBucketPrice = new BigNumber(99836282890)
