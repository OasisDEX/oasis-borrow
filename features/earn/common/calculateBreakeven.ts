import BigNumber from 'bignumber.js'

import { one } from '../../../helpers/zero'

interface CalculateBreakeven {
  depositAmount: BigNumber
  entryFees: BigNumber
  apy: BigNumber
}

export function calculateBreakeven({ depositAmount, entryFees, apy }: CalculateBreakeven) {
  return entryFees.div(depositAmount.times(apy.plus(one)).minus(depositAmount).div(365))
}
