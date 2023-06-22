import {
  AjnaHistoryEvent,
  AjnaHistoryEvents,
} from 'features/ajna/positions/common/helpers/getAjnaHistory'

export const mapAjnaBorrowishEvents = (events: AjnaHistoryEvents): Partial<AjnaHistoryEvent>[] => {
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
      default: {
        console.warn('No ajna event kind found')
        return {}
      }
    }
  })

  return mappedEvents.filter((event) => !!event)
}
