import type BigNumber from 'bignumber.js'

// Special case where LUP below HTP
export const getIsActiveWhenLupBelowHtp = ({
  price,
  lowestUtilizedPrice,
  highestThresholdPrice,
}: {
  price: BigNumber
  lowestUtilizedPrice: BigNumber
  highestThresholdPrice: BigNumber
}) => price.gte(lowestUtilizedPrice) && lowestUtilizedPrice.lte(highestThresholdPrice)
