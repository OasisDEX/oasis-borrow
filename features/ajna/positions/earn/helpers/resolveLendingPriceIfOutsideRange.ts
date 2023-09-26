import type BigNumber from 'bignumber.js'
import { snapToPredefinedValues } from 'features/ajna/positions/earn/helpers/snapToPredefinedValues'

export const resolveLendingPriceIfOutsideRange = ({
  manualAmount,
}: {
  manualAmount: BigNumber
}) => {
  return snapToPredefinedValues(manualAmount)
}
