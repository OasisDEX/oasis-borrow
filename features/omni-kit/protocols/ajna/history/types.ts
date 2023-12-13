import type BigNumber from 'bignumber.js'
import type { AaveHistoryEvent } from 'features/omni-kit/protocols/aave/history/types'
import type { AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import type {
  PositionHistoryEvent,
  PositionHistoryResponse,
  Trigger,
} from 'features/positionHistory/types'

export interface AjnaHistoryResponse extends PositionHistoryResponse {
  originationFee: string
  originationFeeInQuoteToken: string
}

export interface AjnaBorrowerEventsResponse {
  id: string
  kind: string
  timestamp: string
  txHash: string
  settledDebt: string
  debtToCover: string
  collateralForLiquidation: string
  remainingCollateral: string
  auction: {
    id: string
  } | null
}

export function hasTrigger(
  event: Partial<AjnaUnifiedHistoryEvent> | Partial<AaveHistoryEvent>,
): event is Partial<AaveHistoryEvent> & { trigger: Trigger } {
  return (
    Object.entries(event).find(([key, value]) => key === 'trigger' && value !== null) !== undefined
  )
}

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
