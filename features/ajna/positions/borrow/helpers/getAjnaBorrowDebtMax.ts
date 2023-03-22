import { AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'

interface AjnaBorrowDebtMaxParams {
  digits: number
  position: AjnaPosition
  simulation?: AjnaPosition
}

export function getAjnaBorrowDebtMax({
  digits,
  position: {
    collateralAmount,
    debtAmount,
    pool: { lowestUtilizedPrice },
  },
  simulation,
}: AjnaBorrowDebtMaxParams) {
  const resolveedCollateralAmount = simulation?.collateralAmount || collateralAmount
  const resolvedLowestUtilizedPrice = simulation?.pool.lowestUtilizedPrice || lowestUtilizedPrice

  return resolveedCollateralAmount
    .times(resolvedLowestUtilizedPrice)
    .minus(debtAmount)
    .decimalPlaces(digits, BigNumber.ROUND_DOWN)
}
