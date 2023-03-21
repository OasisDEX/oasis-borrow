import { AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

interface AjnaBorrowDebtMinParams {
  position: AjnaPosition
}

export function getAjnaBorrowDebtMin({
  position: {
    debtAmount,
    pool: { poolMinDebtAmount },
  },
}: AjnaBorrowDebtMinParams) {
  return BigNumber.max(zero, poolMinDebtAmount.minus(debtAmount))
}
