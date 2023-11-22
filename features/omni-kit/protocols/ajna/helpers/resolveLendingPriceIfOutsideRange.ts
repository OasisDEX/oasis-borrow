import type BigNumber from 'bignumber.js'
import { snapToPredefinedValues } from 'features/omni-kit/protocols/ajna/helpers'

export const resolveLendingPriceIfOutsideRange = ({
  manualAmount,
}: {
  manualAmount: BigNumber
}) => {
  return snapToPredefinedValues(manualAmount)
}
