import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

// The origination fee is calculated as the greatest of the current annualized
// borrower interest rate divided by 52 (one week of interest) or 5 bps multiplied by the loan’s new
// debt.
export const getAjnaBorrowOriginationFee = ({
  interestRate,
  generateAmount,
}: {
  interestRate: BigNumber
  generateAmount?: BigNumber
}) =>
  generateAmount
    ? BigNumber.max(interestRate.div(52), new BigNumber(0.0005)).times(generateAmount)
    : zero
