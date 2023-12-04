import type { LendingPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface OmniBorrowPaybackMaxParams {
  balance: BigNumber
  position: LendingPosition
}

export function getOmniBorrowPaybackMax({
  balance,
  position: { debtAmount },
}: OmniBorrowPaybackMaxParams) {
  return BigNumber.min(debtAmount, balance)
}
