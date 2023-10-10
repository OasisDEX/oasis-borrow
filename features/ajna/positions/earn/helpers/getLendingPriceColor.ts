import type BigNumber from 'bignumber.js'
import { lendingPriceColors } from 'features/ajna/positions/earn/consts'

interface GetLendingPriceColorParams {
  highestThresholdPrice: BigNumber
  lowestUtilizedPrice: BigNumber
  mostOptimisticMatchingPrice: BigNumber
  price: BigNumber
}

export const getLendingPriceColor = ({
  highestThresholdPrice,
  lowestUtilizedPrice,
  mostOptimisticMatchingPrice,
  price,
}: GetLendingPriceColorParams): { color: string; index: number } => {
  if (price.lt(highestThresholdPrice)) return { color: lendingPriceColors.belowHtp, index: 0 }
  if (price.lt(lowestUtilizedPrice)) return { color: lendingPriceColors.belowLup, index: 1 }
  if (price.lt(mostOptimisticMatchingPrice))
    return { color: lendingPriceColors.belowMomp, index: 2 }
  else return { color: lendingPriceColors.aboveMomp, index: 3 }
}
