import type { LendingPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface OmniBorrowPaybackMaxParams {
  balance: BigNumber
  digits: number
  position: LendingPosition
}

export function getOmniBorrowPaybackMax({
  balance,
  digits,
  position: { debtAmount },
}: OmniBorrowPaybackMaxParams) {
  return BigNumber.min(debtAmount, balance).decimalPlaces(digits, BigNumber.ROUND_UP)
}
