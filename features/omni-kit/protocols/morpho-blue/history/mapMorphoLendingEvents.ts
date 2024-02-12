import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'

export const mapMorphoLendingEvents = (
  events: MorphoHistoryEvent[],
): Partial<MorphoHistoryEvent>[] => {
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

    const eventKindWithoutVersion = event.kind.split('_')[0]

    switch (eventKindWithoutVersion) {
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
      case 'Liquidate': {
        return {
          kind: event.kind,
          txHash: event.txHash,
          timestamp: event.timestamp,
          quoteRepaid: event.quoteRepaid,
          repaidAssets: event.repaidAssets,
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
