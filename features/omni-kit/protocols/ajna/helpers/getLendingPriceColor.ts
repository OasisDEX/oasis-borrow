import type BigNumber from 'bignumber.js'
import { omniLendingPriceColors } from 'features/omni-kit/constants'
import { getIsActiveWhenLupBelowHtp } from 'features/omni-kit/protocols/ajna/helpers'

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
  if (getIsActiveWhenLupBelowHtp({ price, highestThresholdPrice, lowestUtilizedPrice }))
    return { color: omniLendingPriceColors[2], index: 2 }

  if (price.lt(highestThresholdPrice)) return { color: omniLendingPriceColors[0], index: 0 }
  if (price.lt(lowestUtilizedPrice)) return { color: omniLendingPriceColors[1], index: 1 }
  if (price.gte(lowestUtilizedPrice)) return { color: omniLendingPriceColors[2], index: 2 }
  else return { color: omniLendingPriceColors[0], index: 0 }
}
