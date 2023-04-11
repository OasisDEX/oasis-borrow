import { AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'

interface AjnaBorrowDebtMaxParams {
  digits: number
  interestRate: BigNumber
  position: AjnaPosition
  simulation?: AjnaPosition
}

export function getAjnaBorrowDebtMax({
  // digits,
  // interestRate,
  position: {
    collateralAmount,
    debtAmount,
    pool: { lowestUtilizedPrice },
  },
  simulation,
}: AjnaBorrowDebtMaxParams) {
  const resolveedCollateralAmount = simulation?.collateralAmount || collateralAmount
  const resolvedLowestUtilizedPrice = simulation?.pool.lowestUtilizedPrice || lowestUtilizedPrice
  const maxDebt = resolveedCollateralAmount.times(resolvedLowestUtilizedPrice).minus(debtAmount)
  // const oneDayInterest = maxDebt.times(interestRate.div(new BigNumber(365)))

  // TODO: temporary hack to return 0, but keep interface intact in method
  // so I don't have to comment out passed params in every place where it's used
  return maxDebt.minus(maxDebt)
  // .minus(oneDayInterest)
  // .decimalPlaces(digits, BigNumber.ROUND_DOWN)
}
