import type {
  MakerHistoryOldItem,
  MakerHistoryOldLiquidationItem,
} from 'handlers/portfolio/positions/handlers/maker/types'

export const mapMakerSubgraphHistoryOld = (
  items: MakerHistoryOldItem[],
  liquidationItems: MakerHistoryOldLiquidationItem[],
) => {
  return items.map((item) => {
    const possiblyStartedLiquidationEvent = liquidationItems.find(
      (liqItem) => liqItem.startedTransaction.toLowerCase() === item.transaction.toLowerCase(),
    )

    const possiblyFinishedLiquidationEvent = liquidationItems.find(
      (liqItem) => liqItem.finishedTransaction.toLowerCase() === item.transaction.toLowerCase(),
    )

    const mappedStartedLiquidationEvent = possiblyStartedLiquidationEvent
      ? {
          collateralAmount: possiblyStartedLiquidationEvent.collateralAmount,
          daiAmount: possiblyStartedLiquidationEvent.daiAmount,
        }
      : {}

    const mappedFinishedLiquidationEvent = possiblyFinishedLiquidationEvent
      ? {
          remainingCollateral: possiblyFinishedLiquidationEvent.remainingCollateral,
          auctionId: possiblyFinishedLiquidationEvent.auctionId,
        }
      : {}

    return {
      ...item,
      timestamp: Number(item.timestamp) * 1000,
      beforeCollateralizationRatio: item.collRatioBefore,
      collateralizationRatio: item.collRatioAfter,
      multiple: item.afterMultiple,
      beforeLiquidationPrice: item.liquidationPriceBefore,
      liquidationPrice: item.liquidationPriceAfter,
      hash: item.transaction,
      loanFee: item.loadFee,
      beforeDebt: item.debtBefore,
      debt: item.debtAfter,
      totalFee: (Number(item.oazoFee) + Number(item.gasFee)).toString(),
      ethPrice: '1', // it's used to calculate fees in USD, but fees from subgraph are already in $
      beforeLockedCollateral: item.collateralBefore,
      lockedCollateral: item.collateralAfter,
      collateralAmount: item.collateralDiff,
      daiAmount: item.debtDiff,
      ...mappedStartedLiquidationEvent,
      ...mappedFinishedLiquidationEvent,
    }
  })
}
