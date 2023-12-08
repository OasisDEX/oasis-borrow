import type BigNumber from 'bignumber.js'

export interface PositionHistoryResponse {
  depositTransfers: {
    amount: string
  }[]
  withdrawTransfers: {
    amount: string
  }[]
  blockNumber: string
  collateralAddress: string
  collateralAfter: string
  collateralBefore: string
  collateralDelta: string
  collateralOraclePrice: string
  collateralToken: string
  collateralTokenPriceUSD: string
  debtAddress: string
  debtAfter: string
  debtBefore: string
  debtDelta: string
  debtOraclePrice: string
  debtToken: string
  debtTokenPriceUSD: string
  depositedUSD: string
  ethPrice: string
  gasFeeUSD: string
  gasPrice: string
  gasUsed: string
  id: string
  kind: string
  liquidationPriceAfter: string
  liquidationPriceBefore: string
  ltvAfter: string
  ltvBefore: string
  marketPrice: string
  multipleAfter: string
  multipleBefore: string
  netValueAfter: string
  netValueBefore: string
  oasisFee: string
  oasisFeeToken: string
  oasisFeeUSD: string
  quoteTokensAfter: string
  quoteTokensBefore: string
  quoteTokensDelta: string
  quoteTokensMoved: string
  moveQuoteFromIndex: string
  moveQuoteToIndex: string
  addOrRemoveIndex: string
  isOpen: boolean
  swapFromAmount: string
  swapFromToken: string
  swapToAmount: string
  swapToToken: string
  timestamp: string
  totalFee: string
  totalFeeInQuoteToken: string
  txHash: string
  withdrawnUSD: string
}

export type AaveCumulativesResponse = {
  id: string
  cumulativeDeposit: string
  cumulativeWithdraw: string
  cumulativeFees: string
  cumulativeDepositInQuoteToken: string
  cumulativeWithdrawInQuoteToken: string
  cumulativeDespositInCollateralToken: string
  cumulativeWithdrawInCollateralToken: string
}
export interface AavePositionHistoryResponse {
  depositTransfers: {
    amount: string
  }[]
  withdrawTransfers: {
    amount: string
  }[]
  blockNumber: string
  collateralAddress: string
  collateralAfter: string
  collateralBefore: string
  collateralDelta: string
  collateralOraclePrice: string
  collateralToken: {
    symbol: string
  }
  collateralTokenPriceUSD: string
  debtAddress: string
  debtAfter: string
  debtBefore: string
  debtDelta: string
  debtOraclePrice: string
  debtToken: {
    symbol: string
  }
  debtTokenPriceUSD: string
  depositedUSD: string
  ethPrice: string
  gasFeeUSD: string
  gasPrice: string
  gasUsed: string
  id: string
  kind: string
  liquidationPriceAfter: string
  liquidationPriceBefore: string
  ltvAfter: string
  ltvBefore: string
  marketPrice: string
  multipleAfter: string
  multipleBefore: string
  netValueAfter: string
  netValueBefore: string
  summerFee: string
  summerFeeToken: string
  summerFeeUSD: string
  swapFromAmount: string
  swapFromToken: string
  swapToAmount: string
  swapToToken: string
  timestamp: string
  totalFee: string
  txHash: string
  withdrawnUSD: string
  trigger: Trigger | null
}

export interface Trigger {
  id: string
  decodedData: string[]
  decodedDataNames: string[]
}

export type PositionHistoryEvent = {
  depositAmount: BigNumber
  withdrawAmount: BigNumber
  blockNumber: BigNumber
  collateralAddress: string
  collateralAfter: BigNumber
  collateralBefore: BigNumber
  collateralDelta: BigNumber
  collateralOraclePrice: BigNumber
  collateralToken: string
  collateralTokenPriceUSD: BigNumber
  debtAddress: string
  debtAfter: BigNumber
  debtBefore: BigNumber
  debtDelta: BigNumber
  debtOraclePrice: BigNumber
  debtToken: string
  debtTokenPriceUSD: BigNumber
  depositedUSD: BigNumber
  ethPrice: BigNumber
  gasFeeUSD: BigNumber
  gasPrice: BigNumber
  gasUsed: BigNumber
  id: string
  kind: string
  liquidationPriceAfter: BigNumber
  liquidationPriceBefore: BigNumber
  ltvAfter: BigNumber
  ltvBefore: BigNumber
  marketPrice: BigNumber
  multipleAfter: BigNumber
  multipleBefore: BigNumber
  netValueAfter: BigNumber
  netValueBefore: BigNumber
  oasisFee: BigNumber
  oasisFeeToken: string
  oasisFeeUSD: BigNumber
  isOpen: boolean
  swapFromAmount: BigNumber
  swapFromToken: string
  swapToAmount: BigNumber
  swapToToken: string
  timestamp: number
  totalFee: BigNumber
  txHash: string
  withdrawnUSD: BigNumber
}
