import { AjnaPosition } from '@oasisdex/oasis-actions-poc'

interface AjnaBorrowDebtMaxParams {
  position: AjnaPosition
  simulation?: AjnaPosition
}

export function getAjnaBorrowDebtMax({
  position: {
    collateralAmount,
    debtAmount,
    pool: { lowestUtilizedPrice },
  },
  simulation,
}: AjnaBorrowDebtMaxParams) {
  const resolveedCollateralAmount = simulation?.collateralAmount || collateralAmount
  const resolvedLowestUtilizedPrice = simulation?.pool.lowestUtilizedPrice || lowestUtilizedPrice

  return resolveedCollateralAmount.times(resolvedLowestUtilizedPrice).minus(debtAmount)
}
