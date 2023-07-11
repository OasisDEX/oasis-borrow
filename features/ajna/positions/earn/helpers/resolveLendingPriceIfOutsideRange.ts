import BigNumber from 'bignumber.js'
import {
  mappedAjnaBuckets,
  snapToPredefinedValues,
} from 'features/ajna/positions/earn/helpers/snapToPredefinedValues'
import { zero } from 'helpers/zero'

export const resolveLendingPriceIfOutsideRange = ({
  manualAmount,
  min,
  max,
  fallbackValue,
}: {
  manualAmount: BigNumber
  min: BigNumber
  max: BigNumber
  fallbackValue: BigNumber
}) => {
  const snappedValue = snapToPredefinedValues(manualAmount)
  const index = mappedAjnaBuckets.indexOf(snappedValue)
  const selectedValue = mappedAjnaBuckets.at(index) || zero

  if (selectedValue.gt(max) || selectedValue.lt(min)) {
    return fallbackValue
  }

  return selectedValue
}
