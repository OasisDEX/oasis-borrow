import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'

export const mapAjnaEarnEvents = (events: AjnaHistoryEvent[]): Partial<AjnaHistoryEvent>[] => {
  const mappedEvents = events.map((event) => {
    const basicData = {
      kind: event.kind,
      txHash: event.txHash,
      timestamp: event.timestamp,
      totalFee: event.totalFee,
      totalFeeInQuoteToken: event.totalFee,
      debtAddress: event.debtAddress,
      collateralAddress: event.collateralAddress,
      addOrRemovePrice: event.addOrRemovePrice,
      isOpen: event.isOpen,
    }
    switch (event.kind) {
      case 'AjnaMoveQuote':
      case 'AjnaMoveQuoteNft':
        return {
          moveQuoteFromPrice: event.moveQuoteFromPrice,
          moveQuoteToPrice: event.moveQuoteToPrice,
          ...basicData,
        }
      case 'AjnaSupplyAndMoveQuote':
      case 'AjnaSupplyAndMoveQuoteNft':
      case 'AjnaWithdrawAndMoveQuote':
      case 'AjnaWithdrawAndMoveQuoteNft':
      case 'AjnaSupplyQuoteMintNftAndStake':
        return {
          quoteTokensBefore: event.quoteTokensBefore,
          quoteTokensAfter: event.quoteTokensAfter,
          moveQuoteFromPrice: event.moveQuoteFromPrice,
          moveQuoteToPrice: event.moveQuoteToPrice,
          ...basicData,
        }
      case 'AjnaSupplyQuote':
      case 'AjnaSupplyQuoteNft':
      case 'AjnaWithdrawQuote':
      case 'AjnaWithdrawQuoteNft':
      case 'AjnaUnstakeNftAndClaimCollateral':
      case 'AjnaUnstakeNftAndWithdrawQuote':
        return {
          quoteTokensBefore: event.quoteTokensBefore,
          quoteTokensAfter: event.quoteTokensAfter,
          ...basicData,
        }
      default: {
        console.warn('No ajna event kind found')
        return {}
      }
    }
  })

  return mappedEvents.filter((event) => !!event && Object.keys(event).length > 0)
}
