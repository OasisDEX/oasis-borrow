import type { BorrowishPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface AjnaBorrowPaybackMaxParams {
  balance: BigNumber
  digits: number
  position: BorrowishPosition
}

export function getAjnaBorrowPaybackMax({
  balance,
  digits,
  position: { debtAmount },
}: AjnaBorrowPaybackMaxParams) {
  return BigNumber.min(debtAmount, balance).decimalPlaces(digits, BigNumber.ROUND_UP)
}
