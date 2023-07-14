import { AjnaUnifiedHistoryEvent } from 'features/ajna/common/ajnaUnifiedHistoryEvent'

export const mapAjnaBorrowishEvents = (
  events: AjnaUnifiedHistoryEvent[],
): Partial<AjnaUnifiedHistoryEvent>[] => {
  const mappedEvents = events.map((event) => {
    const basicData = {
      kind: event.kind,
      txHash: event.txHash,
      timestamp: event.timestamp,
      ltvBefore: event.ltvBefore,
      ltvAfter: event.ltvAfter,
      liquidationPriceBefore: event.liquidationPriceBefore,
      liquidationPriceAfter: event.liquidationPriceAfter,
      totalFee: event.totalFee,
      debtAddress: event.debtAddress,
      collateralAddress: event.collateralAddress,
      originationFee: event.originationFee,
      isOpen: event.isOpen,
    }
    switch (event.kind) {
      case 'AjnaDeposit':
      case 'AjnaWithdraw':
        return {
          collateralBefore: event.collateralBefore,
          collateralAfter: event.collateralAfter,
          ...basicData,
        }
      case 'AjnaBorrow':
      case 'AjnaRepay':
        return {
          debtBefore: event.debtBefore,
          debtAfter: event.debtAfter,
          ...basicData,
        }
      case 'AjnaDepositBorrow':
      case 'AjnaRepayWithdraw':
        return {
          collateralBefore: event.collateralBefore,
          collateralAfter: event.collateralAfter,
          debtBefore: event.debtBefore,
          debtAfter: event.debtAfter,
          ...basicData,
        }
      case 'AuctionSettle': {
        return {
          settledDebt: event.settledDebt,
          remainingCollateral: event.remainingCollateral,
          kind: event.kind,
          timestamp: event.timestamp,
          txHash: event.txHash,
        }
      }
      case 'Kick': {
        return {
          kind: event.kind,
          debtToCover: event.debtToCover,
          collateralForLiquidation: event.collateralForLiquidation,
          timestamp: event.timestamp,
          txHash: event.txHash,
        }
      }
      default: {
        console.warn('No ajna event kind found')
        return {}
      }
    }
  })

  return mappedEvents.filter((event) => !!event)
}
