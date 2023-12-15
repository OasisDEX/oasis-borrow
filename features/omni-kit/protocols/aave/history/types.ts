import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent, Trigger } from 'features/positionHistory/types'

// TODO to be removed when implementing aave history, dummy aave history interface
export interface AaveHistoryEvent extends PositionHistoryEvent {
  quoteTokensAfter?: BigNumber
  quoteTokensBefore?: BigNumber
  quoteTokensDelta?: BigNumber
  quoteTokensMoved?: BigNumber
  moveQuoteFromPrice?: BigNumber
  moveQuoteToPrice?: BigNumber
  addOrRemovePrice?: BigNumber
  totalFeeInQuoteToken?: BigNumber
  trigger?: Trigger
}

export type AaveCumulativeData = {
  cumulativeDepositUSD: BigNumber
  cumulativeDepositInQuoteToken: BigNumber
  cumulativeDespositInCollateralToken: BigNumber
  cumulativeWithdrawUSD: BigNumber
  cumulativeWithdrawInQuoteToken: BigNumber
  cumulativeWithdrawInCollateralToken: BigNumber
  cumulativeFeesUSD: BigNumber
  cumulativeFeesInQuoteToken: BigNumber
  cumulativeFeesInCollateralToken: BigNumber
}
