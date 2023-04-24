import { AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'

interface AjnaBorrowDebtMaxParams {
  precision: number
  position: AjnaPosition
  simulation?: AjnaPosition
}

export function getAjnaBorrowDebtMax({ precision, position, simulation }: AjnaBorrowDebtMaxParams) {
  const maxDebt = position.debtAvailable(simulation?.collateralAmount || position.collateralAmount)

  return maxDebt.decimalPlaces(precision, BigNumber.ROUND_DOWN)
}
