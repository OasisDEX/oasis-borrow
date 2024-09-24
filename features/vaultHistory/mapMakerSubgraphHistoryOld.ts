import type { MakerHistoryOldItem } from 'handlers/portfolio/positions/handlers/maker/types'

export const mapMakerSubgraphHistoryOld = (items: MakerHistoryOldItem[]) => {
  return items.map((item) => {
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
    }
  })
}
