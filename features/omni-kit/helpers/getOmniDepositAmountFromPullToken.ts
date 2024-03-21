import type BigNumber from 'bignumber.js'
import { omniDefaultOverviewSimulationDeposit } from 'features/omni-kit/constants'
import type { OmniSwapToken } from 'features/omni-kit/types'

interface GetOmniDepositAmountFromPullTokenParams {
  pullToken?: OmniSwapToken
  depositAmount?: BigNumber
  quotePrice: BigNumber
}

export function getOmniDepositAmountFromPullToken({
  depositAmount,
  pullToken,
  quotePrice,
}: GetOmniDepositAmountFromPullTokenParams) {
  return (
    (pullToken && depositAmount
      ? depositAmount.times(pullToken.price.div(quotePrice))
      : depositAmount) ?? omniDefaultOverviewSimulationDeposit
  )
}
