import { zero } from 'helpers/zero'

export const defaultLendingCumulatives = {
  borrowCumulativeDepositUSD: zero,
  borrowCumulativeDepositInQuoteToken: zero,
  borrowCumulativeDepositInCollateralToken: zero,
  borrowCumulativeWithdrawUSD: zero,
  borrowCumulativeWithdrawInQuoteToken: zero,
  borrowCumulativeWithdrawInCollateralToken: zero,
  borrowCumulativeCollateralDeposit: zero,
  borrowCumulativeCollateralWithdraw: zero,
  borrowCumulativeDebtDeposit: zero,
  borrowCumulativeDebtWithdraw: zero,
  borrowCumulativeFeesUSD: zero,
  borrowCumulativeFeesInQuoteToken: zero,
  borrowCumulativeFeesInCollateralToken: zero,
}

export const defaultEarnCumulatives = {
  earnCumulativeDepositUSD: zero,
  earnCumulativeDepositInQuoteToken: zero,
  earnCumulativeDepositInCollateralToken: zero,
  earnCumulativeWithdrawUSD: zero,
  earnCumulativeWithdrawInQuoteToken: zero,
  earnCumulativeWithdrawInCollateralToken: zero,
  earnCumulativeFeesUSD: zero,
  earnCumulativeFeesInQuoteToken: zero,
  earnCumulativeFeesInCollateralToken: zero,
  earnCumulativeQuoteTokenDeposit: zero,
  earnCumulativeQuoteTokenWithdraw: zero,
}
