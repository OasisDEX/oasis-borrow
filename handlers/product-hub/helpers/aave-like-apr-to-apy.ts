import type BigNumber from 'bignumber.js'
import { SECONDS_PER_YEAR } from 'components/constants'
import { one } from 'helpers/zero'

// Context: https://docs.aave.com/developers/v/2.0/guides/apy-and-apr
export const aaveLikeAprToApy = (variableBorrowRate: BigNumber) => {
  return one
    .plus(variableBorrowRate.div(SECONDS_PER_YEAR))
    .pow(SECONDS_PER_YEAR)
    .minus(one)
    .toPrecision(12) // rule of thumb number
}
