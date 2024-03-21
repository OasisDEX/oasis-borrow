import type { Erc4626HistoryEvent } from './types'

export const mapErc4626Events = (events: Erc4626HistoryEvent[]): Partial<Erc4626HistoryEvent>[] => {
  return events.map((event): Partial<Erc4626HistoryEvent> => {
    return {
      kind: event.kind,
      txHash: event.txHash,
      timestamp: event.timestamp,
      quoteToken: event.quoteToken,
      quoteTokensPriceUSD: event.quoteTokensPriceUSD,
      quoteTokensAfter: event.quoteTokensAfter,
      quoteTokensBefore: event.quoteTokensBefore,
      quoteTokensDelta: event.quoteTokensDelta,
      totalFee: event.totalFee,
      swapToAmount: event.swapToAmount,
      swapFromToken: event.swapFromToken,
      swapFromAmount: event.swapFromAmount,
      swapToToken: event.swapToToken,
    }
  })
}
