import type { EarnCumulativesData, EarnCumulativesRawData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

export const mapOmniEarnCumulatives = ({
  earnCumulativeDepositUSD,
  earnCumulativeDepositInQuoteToken,
  earnCumulativeDepositInCollateralToken,
  earnCumulativeWithdrawUSD,
  earnCumulativeWithdrawInQuoteToken,
  earnCumulativeWithdrawInCollateralToken,
  earnCumulativeFeesUSD,
  earnCumulativeFeesInCollateralToken,
  earnCumulativeFeesInQuoteToken,
  earnCumulativeQuoteTokenDeposit,
  earnCumulativeQuoteTokenWithdraw,
}: EarnCumulativesRawData): EarnCumulativesData => {
  return {
    earnCumulativeDepositUSD: new BigNumber(earnCumulativeDepositUSD),
    earnCumulativeDepositInQuoteToken: new BigNumber(earnCumulativeDepositInQuoteToken),
    earnCumulativeDepositInCollateralToken: new BigNumber(earnCumulativeDepositInCollateralToken),
    earnCumulativeWithdrawUSD: new BigNumber(earnCumulativeWithdrawUSD),
    earnCumulativeWithdrawInQuoteToken: new BigNumber(earnCumulativeWithdrawInQuoteToken),
    earnCumulativeWithdrawInCollateralToken: new BigNumber(earnCumulativeWithdrawInCollateralToken),
    earnCumulativeFeesUSD: new BigNumber(earnCumulativeFeesUSD),
    earnCumulativeFeesInCollateralToken: new BigNumber(earnCumulativeFeesInCollateralToken),
    earnCumulativeFeesInQuoteToken: new BigNumber(earnCumulativeFeesInQuoteToken),
    earnCumulativeQuoteTokenDeposit: new BigNumber(earnCumulativeQuoteTokenDeposit),
    earnCumulativeQuoteTokenWithdraw: new BigNumber(earnCumulativeQuoteTokenWithdraw),
  }
}
