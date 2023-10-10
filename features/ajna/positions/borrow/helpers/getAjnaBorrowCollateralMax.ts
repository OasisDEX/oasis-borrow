import type { AjnaPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface AjnaBorrowCollateralMaxParams {
  digits: number
  position: AjnaPosition
  simulation?: AjnaPosition
}

export function getAjnaBorrowCollateralMax({
  digits,
  position: {
    collateralAmount,
    debtAmount,
    pool: { lowestUtilizedPrice },
  },
  simulation,
}: AjnaBorrowCollateralMaxParams) {
  const resolvedDebtAmount = simulation?.debtAmount || debtAmount
  const resolvedLowestUtilizedPrice = simulation?.pool.lowestUtilizedPrice || lowestUtilizedPrice

  return collateralAmount
    .minus(resolvedDebtAmount.div(resolvedLowestUtilizedPrice))
    .decimalPlaces(digits, BigNumber.ROUND_DOWN)
}
