import { AjnaPosition } from '@oasisdex/oasis-actions-poc'

interface AjnaBorrowCollateralMaxParams {
  position: AjnaPosition
  simulation?: AjnaPosition
}

export function getAjnaBorrowCollateralMax({
  position: {
    collateralAmount,
    debtAmount,
    pool: { lowestUtilizedPrice },
  },
  simulation,
}: AjnaBorrowCollateralMaxParams) {
  const resolveedDebtAmount = simulation?.debtAmount || debtAmount
  const resolveedLowestUtilizedPrice = simulation?.pool.lowestUtilizedPrice || lowestUtilizedPrice

  return collateralAmount.minus(resolveedDebtAmount.div(resolveedLowestUtilizedPrice))
}
