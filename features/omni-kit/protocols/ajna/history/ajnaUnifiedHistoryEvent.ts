import type { AjnaBorrowerEvent, AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
import { zero } from 'helpers/zero'

export const ajnaUnifiedHistoryItem = {
  depositAmount: zero,
  withdrawAmount: zero,
  blockNumber: zero,
  collateralAddress: '',
  collateralAfter: zero,
  collateralBefore: zero,
  collateralDelta: zero,
  collateralOraclePrice: zero,
  collateralToken: '',
  collateralTokenPriceUSD: zero,
  debtAddress: '',
  debtAfter: zero,
  debtBefore: zero,
  debtDelta: zero,
  debtOraclePrice: zero,
  debtToken: '',
  debtTokenPriceUSD: zero,
  depositedUSD: zero,
  ethPrice: zero,
  gasFeeUSD: zero,
  gasPrice: zero,
  gasUsed: zero,
  id: '',
  kind: '',
  liquidationPriceAfter: zero,
  liquidationPriceBefore: zero,
  ltvAfter: zero,
  ltvBefore: zero,
  marketPrice: zero,
  multipleAfter: zero,
  multipleBefore: zero,
  netValueAfter: zero,
  netValueBefore: zero,
  oasisFee: zero,
  oasisFeeToken: '',
  oasisFeeUSD: zero,
  quoteTokensAfter: zero,
  quoteTokensBefore: zero,
  quoteTokensDelta: zero,
  quoteTokensMoved: zero,
  moveQuoteFromPrice: zero,
  moveQuoteToPrice: zero,
  addOrRemovePrice: zero,
  isOpen: false,
  swapFromAmount: zero,
  swapFromToken: '',
  swapToAmount: zero,
  swapToToken: '',
  originationFee: zero,
  originationFeeInQuoteToken: zero,
  timestamp: 0,
  totalFee: zero,
  totalFeeInQuoteToken: zero,
  txHash: '',
  withdrawnUSD: zero,
  settledDebt: zero,
  debtToCover: zero,
  collateralForLiquidation: zero,
  remainingCollateral: zero,
  auction: undefined,
}

export type AjnaUnifiedHistoryEvent = AjnaHistoryEvent & AjnaBorrowerEvent
