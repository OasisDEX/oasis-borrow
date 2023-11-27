import type BigNumber from 'bignumber.js'
import { convertSliderValuesToPercents } from 'features/omni-kit/protocols/ajna/helpers'

export const convertAjnaSliderThresholds = ({
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
