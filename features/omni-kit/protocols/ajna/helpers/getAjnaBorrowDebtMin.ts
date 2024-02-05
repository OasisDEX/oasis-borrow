import type { AjnaPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

interface AjnaBorrowDebtMinParams {
  digits: number
  position: AjnaPosition
}

export function getAjnaBorrowDebtMin({
  digits,
  position: {
    debtAmount,
    pool: { poolMinDebtAmount, loansCount },
  },
}: AjnaBorrowDebtMinParams) {
  return loansCount.gt(10)
    ? BigNumber.max(
        zero,
        poolMinDebtAmount.minus(debtAmount).decimalPlaces(digits, BigNumber.ROUND_UP),
      )
    : zero
}
