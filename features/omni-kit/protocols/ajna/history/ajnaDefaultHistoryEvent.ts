import { unifiedDefaultHistoryItem } from 'features/positionHistory/consts'
import { zero } from 'helpers/zero'

export const ajnaDefaultHistoryEvent = {
  ...unifiedDefaultHistoryItem,
  quoteTokensMoved: zero,
  moveQuoteFromPrice: zero,
  moveQuoteToPrice: zero,
  addOrRemovePrice: zero,
  originationFee: zero,
  originationFeeInQuoteToken: zero,
  interestRate: zero,
  settledDebt: zero,
  debtToCover: zero,
  collateralForLiquidation: zero,
  remainingCollateral: zero,
  auction: undefined,
}
