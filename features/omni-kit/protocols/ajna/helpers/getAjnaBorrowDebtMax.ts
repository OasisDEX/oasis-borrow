import type { AjnaPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface AjnaBorrowDebtMaxParams {
  digits: number
  position: AjnaPosition
  simulation?: AjnaPosition
}

export function getAjnaBorrowDebtMax({ digits, position, simulation }: AjnaBorrowDebtMaxParams) {
  const maxDebt = position.debtAvailable(simulation?.collateralAmount || position.collateralAmount)

  return maxDebt.decimalPlaces(digits, BigNumber.ROUND_DOWN)
}
