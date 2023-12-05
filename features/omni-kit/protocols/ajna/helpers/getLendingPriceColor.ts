import type BigNumber from 'bignumber.js'
import { omniLendingPriceColors } from 'features/omni-kit/constants'

interface GetLendingPriceColorParams {
  highestThresholdPrice: BigNumber
  lowestUtilizedPrice: BigNumber
  price: BigNumber
}

export const getLendingPriceColor = ({
  highestThresholdPrice,
  lowestUtilizedPrice,
  price,
}: GetLendingPriceColorParams): { color: string; index: number } => {
  if (price.lt(highestThresholdPrice)) return { color: omniLendingPriceColors[0], index: 0 }
  if (price.lt(lowestUtilizedPrice)) return { color: omniLendingPriceColors[1], index: 1 }
  else return { color: omniLendingPriceColors[0], index: 2 }
}
