import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent } from 'features/positionHistory/types'

interface QuoteToken {
  id: string
  address: string
  decimals: string
  symbol: string
}

interface Transfer {
  id: string
  priceInUSD: string
  token: string
  from: string
  to: string
  amount: string
  amountUSD: string
  txHash: string
}

export interface Erc4626EarnEventResponse {
  id: string
  kind: string
  quoteToken: QuoteToken
  isOpen: boolean
  depositedUSD: string
  depositedInQuoteToken: string
  depositTransfers: Transfer[]
  withdrawnUSD: string
  withdrawnInQuoteToken: string
  withdrawTransfers: Transfer[]
  quoteAddress: string
  quoteBefore: string
  quoteAfter: string
  quoteDelta: string
  quoteTokenPriceUSD: string
  swapToToken: string
  swapToAmount: string
  swapFromToken: string
  swapFromAmount: string
  gasFeeInQuoteToken: string
  marketPrice: string
  oasisFeeToken: string
  oasisFee: string
  oasisFeeUSD: string
  oasisFeeInQuoteToken: string
  gasUsed: string
  gasPrice: string
  gasFeeUSD: string
  totalFee: string
  totalFeeUSD: string
  totalFeeInQuoteToken: string
  ethPrice: string
  timestamp: string
  blockNumber: string
  txHash: string
}

export interface Erc4626SummerEventsResponse {
  summerEvents: Erc4626EarnEventResponse[]
}

type Erc4626HistoryEventExtension = {
  quoteTokensAfter: BigNumber
  quoteTokensBefore: BigNumber
  quoteTokensDelta: BigNumber
  quoteTokensPriceUSD: BigNumber
  quoteToken: string
}

export type Erc4626HistoryEvent = PositionHistoryEvent & Erc4626HistoryEventExtension
