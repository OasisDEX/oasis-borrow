import type { LendingPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface OmniBorrowDebtMaxParams {
  digits: number
  position: LendingPosition
  simulation?: LendingPosition
}

export function getOmniBorrowDebtMax({ digits, position, simulation }: OmniBorrowDebtMaxParams) {
  const maxDebt = position.debtAvailable(simulation?.collateralAmount || position.collateralAmount)

  return maxDebt.decimalPlaces(digits, BigNumber.ROUND_DOWN)
}
