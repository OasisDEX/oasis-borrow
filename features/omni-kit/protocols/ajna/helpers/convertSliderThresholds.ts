import type BigNumber from 'bignumber.js'
import { convertSliderValuesToPercents } from 'features/omni-kit/protocols/ajna/helpers'

export const convertSliderThresholds = ({
  min,
  max,
  highestThresholdPrice,
  lowestUtilizedPrice,
  mostOptimisticMatchingPrice,
}: {
  min: BigNumber
  max: BigNumber
  highestThresholdPrice: BigNumber
  lowestUtilizedPrice: BigNumber
  mostOptimisticMatchingPrice: BigNumber
}) => {
  return {
    htpPercentage: convertSliderValuesToPercents(highestThresholdPrice, min, max),
    lupPercentage: convertSliderValuesToPercents(lowestUtilizedPrice, min, max),
    mompPercentage: convertSliderValuesToPercents(mostOptimisticMatchingPrice, min, max),
  }
}

export const convertAjnaOmniSliderThresholds = ({
  min,
  max,
  highestThresholdPrice,
  lowestUtilizedPrice,
}: {
  min: BigNumber
  max: BigNumber
  highestThresholdPrice: BigNumber
  lowestUtilizedPrice: BigNumber
}) => {
  return {
    htpPercentage: convertSliderValuesToPercents(highestThresholdPrice, min, max),
    lupPercentage: convertSliderValuesToPercents(lowestUtilizedPrice, min, max),
  }
}
