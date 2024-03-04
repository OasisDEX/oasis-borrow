import type { NetworkIds } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'

export interface GetTriggersParams {
  networkId: NetworkIds
  dpm: UserDpmAccount
}

export type AaveStopLossToCollateral = {
  triggerTypeName: 'AaveStopLossToCollateralV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    ltv: string
  }
}
export type AaveStopLossToDebt = {
  triggerTypeName: 'AaveStopLossToDebtV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    ltv: string
  }
}
export type SparkStopLossToCollateral = {
  triggerTypeName: 'SparkStopLossToCollateralV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    ltv: string
  }
}
export type SparkStopLossToDebt = {
  triggerTypeName: 'SparkStopLossToDebtV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    ltv: string
  }
}
export type AaveStopLossToCollateralDMA = {
  triggerTypeName: 'DmaAaveStopLossToCollateralV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    ltv: string
  }
}

export type AaveStopLossToDebtDMA = {
  triggerTypeName: 'DmaAaveStopLossToDebtV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    ltv: string
  }
}
export type SparkStopLossToCollateralDMA = {
  triggerTypeName: 'DmaSparkStopLossToCollateralV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    ltv: string
  }
}
export type SparkStopLossToDebtDMA = {
  triggerTypeName: 'DmaSparkStopLossToDebtV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    ltv: string
  }
}

export type DmaAaveBasicBuy = {
  triggerTypeName: 'DmaAaveBasicBuyV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    operationName: string
    executionLtv: string
    targetLtv: string
    maxBuyPrice: string
    deviation: string
    maxBaseFeeInGwei: string
  }
}
export type DmaSparkBasicSell = {
  triggerTypeName: 'DmaSparkBasicSellV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    operationName: string
    executionLtv: string
    targetLtv: string
    minSellPrice: string
    deviation: string
    maxBaseFeeInGwei: string
  }
}

export type DmaSparkBasicBuy = {
  triggerTypeName: 'DmaSparkBasicBuyV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    operationName: string
    executionLtv: string
    targetLtv: string
    maxBuyPrice: string
    deviation: string
    maxBaseFeeInGwei: string
  }
}
export type DmaAaveBasicSell = {
  triggerTypeName: 'DmaAaveBasicSellV2'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    operationName: string
    executionLtv: string
    targetLtv: string
    minSellPrice: string
    deviation: string
    maxBaseFeeInGwei: string
  }
}

export type DmaAaveTrailingStopLoss = {
  triggerTypeName: 'DmaAaveTrailingStopLoss'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    operationName: string
    collateralOracle: string
    collateralAddedRoundId: string
    debtOracle: string
    debtAddedRoundId: string
    trailingDistance: string
    closeToCollateral: string
  }
  dynamicParams: {
    executionPrice: string
    originalExecutionPrice: string
  }
}

export type DmaSparkTrailingStopLoss = {
  triggerTypeName: 'DmaSparkTrailingStopLoss'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    operationName: string
    collateralOracle: string
    collateralAddedRoundId: string
    debtOracle: string
    debtAddedRoundId: string
    trailingDistance: string
    closeToCollateral: string
  }
  dynamicParams: {
    executionPrice: string
    originalExecutionPrice: string
  }
}

export type DmaAavePartialTakeProfit = {
  triggerTypeName: 'DmaAavePartialTakeProfit'
  triggerType: bigint
  triggerId: string
  decodedParams: {
    collateralToken: string
    debtToken: string
    deviation: string
    executionLtv: string
    executionPrice: string
    maxCoverage: string
    operationName: string
    positionAddress: string
    targetLtv: string
    triggerType: string
  }
}

export type DmaSparkPartialTakeProfit = {
  triggerTypeName: 'DmaAavePartialTakeProfit'
  triggerType: bigint
  triggerId: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    operationName: string
    executionLtv: string
    targetLtv: string
    executionPrice: string
    deviation: string
    closeToCollateral: string
  }
}

export type AaveBasicBuyOrSell = DmaAaveBasicBuy | DmaAaveBasicSell

export type GetTriggersResponse = {
  triggers: {
    aaveStopLossToCollateral?: AaveStopLossToCollateral
    aaveStopLossToCollateralDMA?: AaveStopLossToCollateralDMA
    aaveStopLossToDebt?: AaveStopLossToDebt
    aaveStopLossToDebtDMA?: AaveStopLossToDebtDMA
    sparkStopLossToCollateral?: SparkStopLossToCollateral
    sparkStopLossToCollateralDMA?: SparkStopLossToCollateralDMA
    sparkStopLossToDebt?: SparkStopLossToDebt
    sparkStopLossToDebtDMA?: SparkStopLossToDebtDMA
    aaveBasicBuy?: DmaAaveBasicBuy
    aaveBasicSell?: DmaAaveBasicSell
    sparkBasicBuy?: DmaSparkBasicBuy
    sparkBasicSell?: DmaSparkBasicSell
    aaveTrailingStopLossDMA?: DmaAaveTrailingStopLoss
    sparkTrailingStopLossDMA?: DmaSparkTrailingStopLoss
    aavePartialTakeProfit?: DmaAavePartialTakeProfit
    sparkPartialTakeProfit?: DmaSparkPartialTakeProfit
  }
}
