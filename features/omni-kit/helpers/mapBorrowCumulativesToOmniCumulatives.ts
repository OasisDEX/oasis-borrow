import type { LendingCumulativesData } from '@oasisdex/dma-library'

export const mapBorrowCumulativesToOmniCumulatives = (cumulatives: LendingCumulativesData) => ({
  cumulativeDepositUSD: cumulatives.borrowCumulativeDepositUSD,
  cumulativeWithdrawUSD: cumulatives.borrowCumulativeWithdrawUSD,
  cumulativeFeesUSD: cumulatives.borrowCumulativeFeesUSD,
  cumulativeWithdrawInCollateralToken: cumulatives.borrowCumulativeWithdrawInCollateralToken,
  cumulativeDepositInCollateralToken: cumulatives.borrowCumulativeDepositInCollateralToken,
  cumulativeFeesInCollateralToken: cumulatives.borrowCumulativeFeesInCollateralToken,
  cumulativeWithdrawInQuoteToken: cumulatives.borrowCumulativeWithdrawInQuoteToken,
  cumulativeDepositInQuoteToken: cumulatives.borrowCumulativeDepositInQuoteToken,
  cumulativeFeesInQuoteToken: cumulatives.borrowCumulativeFeesInQuoteToken,
})
