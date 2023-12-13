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
  cumulativeDeposit: BigNumber
  cumulativeWithdraw: BigNumber
  cumulativeFees: BigNumber
  cumulativeFeesInQuoteToken: BigNumber
  cumulativeDepositInQuoteToken: BigNumber
  cumulativeWithdrawInQuoteToken: BigNumber
  cumulativeDespositInCollateralToken: BigNumber
  cumulativeWithdrawInCollateralToken: BigNumber
}
