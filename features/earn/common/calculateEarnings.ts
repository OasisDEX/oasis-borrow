import BigNumber from 'bignumber.js'

import { one } from '../../../helpers/zero'

interface CalculateEarnings {
  depositAmount: BigNumber
  apy: BigNumber
  days: BigNumber
}

export function calculateEarnings({ depositAmount, apy, days }: CalculateEarnings) {
  const earningsAfterFees = depositAmount.times(apy.div(365).times(days).plus(one))

  return {
    earningsAfterFees: earningsAfterFees.minus(depositAmount),
    netValue: earningsAfterFees,
  }
}
