import type BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { LendingProtocol } from 'lendingProtocols'

export interface GetTriggersParams {
  dpmProxy: string
  networkId: NetworkIds
  poolId?: string
  protocol: LendingProtocol
}

// This interface is available also in monorepo, at some point we should probably import it from there
type Trigger = {
  triggerId: string
  triggerData: string
  triggerType: bigint
  decodedParams: unknown
  dynamicParams?: unknown
}

export type MakerBasicBuy = {
  triggerTypeName: 'MakerBasicBuy'
  triggerType: bigint
  triggerId: string
  triggerData: string
  // TODO: needs types, later
}
export type MakerBasicSell = {
  triggerTypeName: 'MakerBasicSell'
  triggerType: bigint
  triggerId: string
  triggerData: string
  // TODO: needs types, later
}

export type MakerStopLossToCollateral = {
  triggerTypeName: 'MakerStopLossToCollateral'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    cdpId: string
    triggerType: string
    collRatio: string
    positionAddress: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    maxCoverage: string
    operationName: ''
  }
}

export type MakerStopLossToDebt = {
  triggerTypeName: 'MakerStopLossToDai'
  triggerType: bigint
  triggerId: string
  triggerData: string
  decodedParams: {
    cdpId: string
    triggerType: string
    collRatio: string
    positionAddress: string
    debtToken: string
    collateralToken: string
    executionLtv: string
    maxCoverage: string
    operationName: ''
  }
}

export type MakerTakeProfitToCollateral = {
  triggerTypeName: 'MakerAutoTakeProfitToCollateral'
  triggerType: bigint
  triggerId: string
  triggerData: string
  // TODO: needs types, later
}

export type MakerTakeProfitToDebt = {
  triggerTypeName: 'MakerAutoTakeProfitToDai'
  triggerType: bigint
  triggerId: string
  triggerData: string
  // TODO: needs types, later
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

export type MorphoBlueStopLoss = Trigger & {
  triggerTypeName: 'MorphoBlueStopLossV2'
  triggerId: string
  triggerData: string
  triggerType: bigint
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

export type MorphoBlueBasicBuy = {
  triggerTypeName: 'MorphoBlueBasicBuyV2'
  triggerId: string
  triggerData: string
  triggerType: bigint
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

export type MorphoBluePartialTakeProfit = {
  triggerTypeName: 'MorphoBluePartialTakeProfit'
  triggerId: string
  triggerData: string
  triggerType: bigint
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
    withdrawToDebt: string
  }
  dynamicParams?: {
    nextProfit: NextProfitDynamicParam
  }
}

export type MorphoBlueBasicSell = {
  triggerTypeName: 'MorphoBlueBasicSellV2'
  triggerId: string
  triggerData: string
  triggerType: bigint
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

export type MorphoBlueTrailingStopLoss = {
  triggerTypeName: 'MorphoBlueTrailingStopLoss'
  triggerId: string
  triggerData: string
  triggerType: bigint
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
    executionPrice?: string
    originalExecutionPrice?: string
  }
}

export type AaveBasicBuyOrSell = DmaAaveBasicBuy | DmaAaveBasicSell
// This interface is available also in monorepo, at some point we should probably import it from there
export type GetTriggersResponse = {
  triggers: {
    maker: {
      basicBuy?: MakerBasicBuy
      basicSell?: MakerBasicSell
      stopLossToCollateral?: MakerStopLossToCollateral
      stopLossToDebt?: MakerStopLossToDebt
      autoTakeProfitToCollateral?: MakerTakeProfitToCollateral
      autoTakeProfitToDebt?: MakerTakeProfitToDebt
    }
    aave3: {
      basicBuy?: DmaAaveBasicBuy
      basicSell?: DmaAaveBasicSell
      partialTakeProfit?: DmaAavePartialTakeProfit
      stopLossToCollateral?: AaveStopLossToCollateral
      stopLossToCollateralDMA?: AaveStopLossToCollateralDMA
      stopLossToDebt?: AaveStopLossToDebt
      stopLossToDebtDMA?: AaveStopLossToDebtDMA
      trailingStopLossDMA?: DmaAaveTrailingStopLoss
    }
    spark: {
      basicBuy?: DmaSparkBasicBuy
      basicSell?: DmaSparkBasicSell
      partialTakeProfit?: DmaSparkPartialTakeProfit
      stopLossToCollateral?: SparkStopLossToCollateral
      stopLossToCollateralDMA?: SparkStopLossToCollateralDMA
      stopLossToDebt?: SparkStopLossToDebt
      stopLossToDebtDMA?: SparkStopLossToDebtDMA
      trailingStopLossDMA?: DmaSparkTrailingStopLoss
    }
    [key: `morphoblue-${string}`]: {
      basicBuy?: MorphoBlueBasicBuy
      basicSell?: MorphoBlueBasicSell
      partialTakeProfit?: MorphoBluePartialTakeProfit
      stopLoss?: MorphoBlueStopLoss
      trailingStopLoss?: MorphoBlueTrailingStopLoss
    }
  }
  flags: {
    aave3: {
      isBasicBuyEnabled: boolean
      isBasicSellEnabled: boolean
      isPartialTakeProfitEnabled: boolean
      isStopLossEnabled: boolean
      isTrailingStopLossEnabled: boolean
    }
    spark: {
      isBasicBuyEnabled: boolean
      isBasicSellEnabled: boolean
      isPartialTakeProfitEnabled: boolean
      isStopLossEnabled: boolean
      isTrailingStopLossEnabled: boolean
    }
    [key: `morphoblue-${string}`]: {
      isBasicBuyEnabled: boolean
      isBasicSellEnabled: boolean
      isPartialTakeProfitEnabled: boolean
      isStopLossEnabled: boolean
      isTrailingStopLossEnabled: boolean
    }
    maker: {
      isBasicBuyEnabled: boolean
      isBasicSellEnabled: boolean
      isStopLossEnabled: boolean
      isAutoTakeProfitEnabled: boolean
    }
  }
  triggerGroup: {
    aaveBasicBuy?: Trigger
    aaveBasicSell?: Trigger
    aavePartialTakeProfit?: Trigger
    aaveStopLoss?: Trigger
    sparkBasicBuy?: Trigger
    sparkBasicSell?: Trigger
    sparkPartialTakeProfit?: Trigger
    sparkStopLoss?: Trigger
    morphoBlueBasicBuy?: Trigger
    morphoBlueBasicSell?: Trigger
    morphoBluePartialTakeProfit?: Trigger
    morphoBlueStopLoss?: Trigger
    makerStopLoss?: Trigger
    makerBasicBuy?: Trigger
    makerBasicSell?: Trigger
    makerAutoTakeProfitToCollateral?: Trigger
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
  | MorphoBlueStopLoss
export type StopLossTriggersWithDecodedParams = StopLossTriggers & WithMappedStopLossDecodedParams

export type TrailingStopLossTriggers =
  | DmaAaveTrailingStopLoss
  | DmaSparkTrailingStopLoss
  | MorphoBlueTrailingStopLoss
export type TrailingStopLossTriggersWithDecodedParams = TrailingStopLossTriggers &
  WithMappedTrailingStopLossDecodedParams

export type AutoSellTriggers = DmaAaveBasicSell | DmaSparkBasicSell | MorphoBlueBasicSell
export type AutoSellTriggersWithDecodedParams = AutoSellTriggers & WithMappedAutoSellDecodedParams

export type AutoBuyTriggers = DmaAaveBasicBuy | DmaSparkBasicBuy | MorphoBlueBasicBuy
export type AutoBuyTriggersWithDecodedParams = AutoBuyTriggers & WithMappedAutoBuyDecodedParams

export type PartialTakeProfitTriggers =
  | DmaAavePartialTakeProfit
  | DmaSparkPartialTakeProfit
  | MorphoBluePartialTakeProfit
export type PartialTakeProfitTriggersWithDecodedParams = PartialTakeProfitTriggers &
  WithMappedPartialTakeProfitDecodedParams
