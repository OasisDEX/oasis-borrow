import type BigNumber from 'bignumber.js'
import type { ProductType } from 'features/aave/types'

export interface OmniNetValuePnlData {
  cumulatives?: {
    cumulativeWithdrawUSD: BigNumber
    cumulativeWithdrawInCollateralToken: BigNumber
    cumulativeWithdrawInQuoteToken: BigNumber
    cumulativeFeesUSD: BigNumber
    cumulativeFeesInCollateralToken: BigNumber
    cumulativeFeesInQuoteToken: BigNumber
    cumulativeDepositUSD: BigNumber
    cumulativeDepositInCollateralToken: BigNumber
    cumulativeDepositInQuoteToken: BigNumber
  }
  productType: ProductType
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  netValueInCollateralToken: BigNumber
  netValueInDebtToken: BigNumber
  collateralToken: string
  debtToken: string
}

export interface OmniNetValuePnlDataReturnType {
  pnl?: {
    pnlToken: string
    percentage: BigNumber
    inToken: BigNumber
    inUsd: BigNumber
  }
  netValue: {
    netValueToken: string
    netValueTokenPrice: BigNumber
    inToken: BigNumber
    inUsd: BigNumber
  }
  pnlCumulatives?: {
    deposit: {
      inUsd: BigNumber
      inToken: BigNumber
    }
    withdraw: {
      inUsd: BigNumber
      inToken: BigNumber
    }
    fees: {
      inUsd: BigNumber
      inToken: BigNumber
    }
  }
}
