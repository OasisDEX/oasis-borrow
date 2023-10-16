import type { BorrowishPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface AjnaBorrowDebtMaxParams {
  digits: number
  position: BorrowishPosition
  simulation?: BorrowishPosition
}

export function getAjnaBorrowDebtMax({ digits, position, simulation }: AjnaBorrowDebtMaxParams) {
  const maxDebt = position.debtAvailable(simulation?.collateralAmount || position.collateralAmount)

  return maxDebt.decimalPlaces(digits, BigNumber.ROUND_DOWN)
}
