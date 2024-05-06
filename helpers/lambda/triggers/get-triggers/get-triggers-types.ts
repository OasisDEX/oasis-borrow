import type BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { LendingProtocol } from 'lendingProtocols'

export interface GetTriggersParams {
  dpmProxy: string
  networkId: NetworkIds
  poolId?: string
  protocol: LendingProtocol
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

type ProfitType = {
  balance: string
  token: {
    decimals: number
    symbol: string
    address: string
  }
}

type NextProfitDynamicParam = {
  triggerPrice: string
  stopLossDynamicPrice: string
  realizedProfitInCollateral: ProfitType
  realizedProfitInDebt: ProfitType
  totalProfitInCollateral: ProfitType
  totalProfitInDebt: ProfitType
  fee: ProfitType
  totalFee: ProfitType
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
    withdrawToDebt: 'true' | 'false'
  }
  dynamicParams?: {
    nextProfit?: NextProfitDynamicParam
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
    withdrawToDebt: 'true' | 'false'
  }
  dynamicParams?: {
    nextProfit?: NextProfitDynamicParam
  }
}

export type AaveBasicBuyOrSell = DmaAaveBasicBuy | DmaAaveBasicSell

// This interface is available also in monorepo, at some point we should probably import it from there
type Trigger = {
  triggerId: string
  triggerData: string
  triggerType: bigint
  decodedParams: unknown
  dynamicParams?: unknown
}
// This interface is available also in monorepo, at some point we should probably import it from there
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
  flags: {
    isAaveStopLossEnabled: boolean
    isSparkStopLossEnabled: boolean
    isAaveBasicBuyEnabled: boolean
    isAaveBasicSellEnabled: boolean
    isSparkBasicBuyEnabled: boolean
    isSparkBasicSellEnabled: boolean
    isAavePartialTakeProfitEnabled: boolean
    isSparkPartialTakeProfitEnabled: boolean
  }
  triggerGroup: {
    aaveStopLoss?: Trigger
    sparkStopLoss?: Trigger
    aaveBasicBuy?: Trigger
    aaveBasicSell?: Trigger
    sparkBasicBuy?: Trigger
    sparkBasicSell?: Trigger
    aavePartialTakeProfit?: Trigger
    sparkPartialTakeProfit?: Trigger
  }
  triggersCount: number
  additionalData?: Record<string, unknown>
}

type WithMappedStopLossDecodedParams = {
  decodedMappedParams: {
    executionLtv?: BigNumber
    ltv?: BigNumber
  }
}

type WithMappedTrailingStopLossDecodedParams = {
  decodedMappedParams: {
    trailingDistance: BigNumber
  }
}

type WithMappedAutoSellDecodedParams = {
  decodedMappedParams: {
    minSellPrice?: BigNumber
    executionLtv: BigNumber
    targetLtv: BigNumber
    maxBaseFeeInGwei: BigNumber
  }
}
type WithMappedAutoBuyDecodedParams = {
  decodedMappedParams: {
    maxBuyPrice?: BigNumber
    executionLtv: BigNumber
    targetLtv: BigNumber
    maxBaseFeeInGwei: BigNumber
  }
}
type WithMappedPartialTakeProfitDecodedParams = {
  decodedMappedParams: {
    executionPrice: BigNumber
    executionLtv: BigNumber
    ltvStep: BigNumber
  }
}

// Types below to be extended when new triggers types will be available on other protocols
export type StopLossTriggers =
  | AaveStopLossToCollateral
  | AaveStopLossToCollateralDMA
  | AaveStopLossToDebt
  | AaveStopLossToDebtDMA
  | SparkStopLossToCollateral
  | SparkStopLossToCollateralDMA
  | SparkStopLossToDebt
  | SparkStopLossToDebtDMA

export type TrailingStopLossTriggers = DmaAaveTrailingStopLoss | DmaSparkTrailingStopLoss
export type AutoSellTriggers = DmaAaveBasicSell | DmaSparkBasicSell
export type AutoBuyTriggers = DmaAaveBasicBuy | DmaSparkBasicBuy
export type PartialTakeProfitTriggers = DmaAavePartialTakeProfit | DmaSparkPartialTakeProfit

export type StopLossTriggersWithDecodedParams = (
  | AaveStopLossToCollateral
  | AaveStopLossToCollateralDMA
  | AaveStopLossToDebt
  | AaveStopLossToDebtDMA
  | SparkStopLossToCollateral
  | SparkStopLossToCollateralDMA
  | SparkStopLossToDebt
  | SparkStopLossToDebtDMA
) &
  WithMappedStopLossDecodedParams
export type AutoSellTriggersWithDecodedParams = AutoSellTriggers & WithMappedAutoSellDecodedParams
export type AutoBuyTriggersWithDecodedParams = AutoBuyTriggers & WithMappedAutoBuyDecodedParams
export type TrailingStopLossTriggersWithDecodedParams = TrailingStopLossTriggers &
  WithMappedTrailingStopLossDecodedParams

export type PartialTakeProfitTriggersWithDecodedParams = PartialTakeProfitTriggers &
  WithMappedPartialTakeProfitDecodedParams
