import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'

export const mapAjnaLendingEvents = (events: AjnaHistoryEvent[]): Partial<AjnaHistoryEvent>[] => {
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
      totalFeeInQuoteToken: event.totalFee,
      debtAddress: event.debtAddress,
      collateralAddress: event.collateralAddress,
      originationFee: event.originationFee,
      originationFeeInQuoteToken: event.originationFeeInQuoteToken,
      isOpen: event.isOpen,
      interestRate: event.interestRate,
    }

    const basicMultiplyData = {
      collateralTokenPriceUSD: event.collateralTokenPriceUSD,
      debtTokenPriceUSD: event.debtTokenPriceUSD,
      collateralBefore: event.collateralBefore,
      collateralAfter: event.collateralAfter,
      debtBefore: event.debtBefore,
      debtAfter: event.debtAfter,
      multipleBefore: event.multipleBefore,
      multipleAfter: event.multipleAfter,
      netValueBefore: event.netValueBefore,
      netValueAfter: event.netValueAfter,
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
      case 'AjnaOpenMultiplyPosition_4':
      case 'AjnaOpenMultiplyPosition_5':
      case 'AjnaAdjustRiskUp_4':
      case 'AjnaAdjustRiskUp_5': {
        return {
          ...basicData,
          ...basicMultiplyData,
          swapToAmount: event.swapToAmount,
        }
      }
      case 'AjnaAdjustRiskDown_4':
      case 'AjnaAdjustRiskDown_5':
      case 'AjnaCloseToCollateralPosition_4':
      case 'AjnaCloseToCollateralPosition_5':
      case 'AjnaCloseToQuotePosition_4':
      case 'AjnaCloseToQuotePosition_5': {
        return {
          ...basicData,
          ...basicMultiplyData,
          swapFromAmount: event.swapFromAmount,
        }
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
        console.warn(`No ajna event kind found ${event.kind}`)
        return {}
      }
    }
  })

  return mappedEvents.filter((event) => !!event && Object.keys(event).length > 0)
}
