import type { LendingCumulativesData, LendingCumulativesRawData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

export const mapOmniLendingCumulatives = ({
  borrowCumulativeDepositUSD,
  borrowCumulativeDepositInQuoteToken,
  borrowCumulativeDepositInCollateralToken,
  borrowCumulativeWithdrawUSD,
  borrowCumulativeWithdrawInQuoteToken,
  borrowCumulativeWithdrawInCollateralToken,
  borrowCumulativeCollateralDeposit,
  borrowCumulativeCollateralWithdraw,
  borrowCumulativeDebtDeposit,
  borrowCumulativeDebtWithdraw,
  borrowCumulativeFeesUSD,
  borrowCumulativeFeesInQuoteToken,
  borrowCumulativeFeesInCollateralToken,
}: LendingCumulativesRawData): LendingCumulativesData => {
  return {
    borrowCumulativeDepositUSD: new BigNumber(borrowCumulativeDepositUSD),
    borrowCumulativeDepositInQuoteToken: new BigNumber(borrowCumulativeDepositInQuoteToken),
    borrowCumulativeDepositInCollateralToken: new BigNumber(
      borrowCumulativeDepositInCollateralToken,
    ),
    borrowCumulativeWithdrawUSD: new BigNumber(borrowCumulativeWithdrawUSD),
    borrowCumulativeWithdrawInQuoteToken: new BigNumber(borrowCumulativeWithdrawInQuoteToken),
    borrowCumulativeWithdrawInCollateralToken: new BigNumber(
      borrowCumulativeWithdrawInCollateralToken,
    ),
    borrowCumulativeCollateralDeposit: new BigNumber(borrowCumulativeCollateralDeposit),
    borrowCumulativeCollateralWithdraw: new BigNumber(borrowCumulativeCollateralWithdraw),
    borrowCumulativeDebtDeposit: new BigNumber(borrowCumulativeDebtDeposit),
    borrowCumulativeDebtWithdraw: new BigNumber(borrowCumulativeDebtWithdraw),
    borrowCumulativeFeesUSD: new BigNumber(borrowCumulativeFeesUSD),
    borrowCumulativeFeesInQuoteToken: new BigNumber(borrowCumulativeFeesInQuoteToken),
    borrowCumulativeFeesInCollateralToken: new BigNumber(borrowCumulativeFeesInCollateralToken),
  }
}
