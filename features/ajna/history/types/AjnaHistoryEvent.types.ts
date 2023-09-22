import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent } from 'features/positionHistory/types'

export interface AjnaHistoryEvent extends PositionHistoryEvent {
  originationFee: BigNumber
  originationFeeInQuoteToken: BigNumber
  quoteTokensAfter: BigNumber
  quoteTokensBefore: BigNumber
  quoteTokensDelta: BigNumber
  quoteTokensMoved: BigNumber
  moveQuoteFromPrice: BigNumber
  moveQuoteToPrice: BigNumber
  addOrRemovePrice: BigNumber
  totalFeeInQuoteToken: BigNumber
}

export type AjnaBorrowerEvent = {
  id: string
  kind: string
  timestamp: number
  txHash: string
  settledDebt: BigNumber
  debtToCover: BigNumber
  collateralForLiquidation: BigNumber
  remainingCollateral: BigNumber
  auction?: {
    id: string
  }
}
