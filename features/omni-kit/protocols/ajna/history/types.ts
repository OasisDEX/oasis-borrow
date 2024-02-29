import type BigNumber from 'bignumber.js'
import type { AaveHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import type {
  PositionHistoryEvent,
  PositionHistoryResponse,
  Trigger,
} from 'features/positionHistory/types'

export interface AjnaHistoryResponse extends PositionHistoryResponse {
  originationFee: string
  originationFeeInQuoteToken: string
  interestRate: string
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
  event: Partial<AjnaHistoryEvent> | Partial<AaveHistoryEvent> | Partial<PositionHistoryEvent>,
): event is Partial<AaveHistoryEvent> & { trigger: Trigger } {
  return (
    Object.entries(event).find(([key, value]) => key === 'trigger' && value !== null) !== undefined
  )
}

type AjnaHistoryEventExtension = {
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
  interestRate: BigNumber
}

type AjnaBorrowerEventExtension = {
  settledDebt: BigNumber
  debtToCover: BigNumber
  collateralForLiquidation: BigNumber
  remainingCollateral: BigNumber
  auction?: {
    id: string
  }
}

export type AjnaHistoryEvent = PositionHistoryEvent &
  AjnaHistoryEventExtension &
  AjnaBorrowerEventExtension
