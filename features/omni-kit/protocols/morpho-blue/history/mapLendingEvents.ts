import type { AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'

export const mapMorphoLendingEvents = (
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
      totalFeeInQuoteToken: event.totalFee,
      debtAddress: event.debtAddress,
      collateralAddress: event.collateralAddress,
      originationFee: event.originationFee,
      originationFeeInQuoteToken: event.originationFeeInQuoteToken,
      isOpen: event.isOpen,
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
      case 'MorphoBlueDeposit':
      case 'MorphoBlueWithdraw':
        return {
          collateralBefore: event.collateralBefore,
          collateralAfter: event.collateralAfter,
          ...basicData,
        }
      case 'MorphoBlueBorrow':
      case 'MorphoBluePayback':
        return {
          debtBefore: event.debtBefore,
          debtAfter: event.debtAfter,
          ...basicData,
        }
      case 'MorphoBlueOpenDepositBorrow':
      case 'MorphoBlueDepositBorrow':
      case 'MorphoBluePaybackWithdraw':
        return {
          collateralBefore: event.collateralBefore,
          collateralAfter: event.collateralAfter,
          debtBefore: event.debtBefore,
          debtAfter: event.debtAfter,
          ...basicData,
        }
      case 'MorphoBlueOpenPosition':
      case 'MorphoBlueAdjustRiskUp': {
        return {
          ...basicData,
          ...basicMultiplyData,
          swapToAmount: event.swapToAmount,
        }
      }
      case 'MorphoBlueAdjustRiskDown':
      case 'MorphoBlueClosePosition': {
        return {
          ...basicData,
          ...basicMultiplyData,
          swapFromAmount: event.swapFromAmount,
        }
      }
      default: {
        console.warn(`No morpho blue event kind found ${event.kind}`)
        return {}
      }
    }
  })

  return mappedEvents.filter((event) => !!event && Object.keys(event).length > 0)
}
