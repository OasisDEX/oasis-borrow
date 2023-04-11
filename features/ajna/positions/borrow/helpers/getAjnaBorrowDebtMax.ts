import { AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

interface AjnaBorrowDebtMaxParams {
  digits: number
  interestRate: BigNumber
  position: AjnaPosition
  simulation?: AjnaPosition
}

// export function getAjnaBorrowDebtMax({
//   digits,
//   interestRate,
//   position: {
//     collateralAmount,
//     debtAmount,
//     pool: { lowestUtilizedPrice },
//   },
//   simulation,
// }: AjnaBorrowDebtMaxParams) {
// const resolveedCollateralAmount = simulation?.collateralAmount || collateralAmount
// const resolvedLowestUtilizedPrice = simulation?.pool.lowestUtilizedPrice || lowestUtilizedPrice
// const maxDebt = resolveedCollateralAmount.times(resolvedLowestUtilizedPrice).minus(debtAmount)
// const oneDayInterest = maxDebt.times(interestRate.div(new BigNumber(365)))

// return maxDebt
//   .minus(oneDayInterest)
//   .decimalPlaces(digits, BigNumber.ROUND_DOWN)
// }
// eslint-disable-next-line no-empty-pattern
export function getAjnaBorrowDebtMax({}: AjnaBorrowDebtMaxParams) {
  return zero
}
