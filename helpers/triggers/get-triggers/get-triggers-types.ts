import type { NetworkIds } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'

export const AaveStopLossToCollateralV2ID = 111n as const
export const AaveStopLossToDebtV2ID = 112n as const
export const SparkStopLossToCollateralV2ID = 117n as const
export const SparkStopLossToDebtV2ID = 118n as const
export const AaveBasicBuyV2ID = 119n as const
export const AaveBasicSellV2ID = 120n as const

export interface GetTriggersParams {
  networkId: NetworkIds
  dpm: UserDpmAccount
}

export type AaveStopLossToCollateral = {
  triggerTypeName: 'AaveStopLossToCollateralV2'
  triggerType: typeof AaveStopLossToCollateralV2ID
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    ltv: string
  }
}

export type AaveStopLossToDebt = {
  triggerTypeName: 'AaveStopLossToDebtV2'
  triggerType: typeof AaveStopLossToDebtV2ID
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    ltv: string
  }
}

export type SparkStopLossToCollateral = {
  triggerTypeName: 'SparkStopLossToCollateralV2'
  triggerType: typeof SparkStopLossToCollateralV2ID
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    ltv: string
  }
}

export type SparkStopLossToDebt = {
  triggerTypeName: 'SparkStopLossToDebtV2'
  triggerType: typeof SparkStopLossToDebtV2ID
  triggerId: string
  triggerData: string
  decodedParams: {
    positionAddress: string
    triggerType: string
    maxCoverage: string
    debtToken: string
    collateralToken: string
    ltv: string
  }
}

export type AaveBasicBuy = {
  triggerTypeName: 'AaveBasicBuyV2'
  triggerType: typeof AaveBasicBuyV2ID
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

export type AaveBasicSell = {
  triggerTypeName: 'AaveBasicSellV2'
  triggerType: typeof AaveBasicSellV2ID
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

export type AaveBasicBuyOrSell = AaveBasicBuy | AaveBasicSell

export type GetTriggersResponse = {
  triggers: {
    aaveStopLossToCollateral?: AaveStopLossToCollateral
    aaveStopLossToDebt?: AaveStopLossToDebt
    sparkStopLossToCollateral?: SparkStopLossToCollateral
    sparkStopLossToDebt?: SparkStopLossToDebt
    aaveBasicBuy?: AaveBasicBuy
    aaveBasicSell?: AaveBasicSell
  }
}
