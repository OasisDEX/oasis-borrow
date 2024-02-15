import type BigNumber from 'bignumber.js'
import { SECONDS_PER_YEAR } from 'components/constants'
import { one } from 'helpers/zero'

// Context: https://docs.aave.com/developers/v/2.0/guides/apy-and-apr
export const aaveLikeAprToApyBN = (rate: BigNumber) => {
  return one.plus(rate.div(SECONDS_PER_YEAR)).pow(SECONDS_PER_YEAR).minus(one)
}

export const aaveLikeAprToApy = (rate: BigNumber) => {
  return aaveLikeAprToApyBN(rate).toPrecision(12) // rule of thumb number
}
