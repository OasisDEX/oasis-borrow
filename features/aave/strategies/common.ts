import type BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import type { ManagePositionAvailableActions, ProductType, StrategyType } from 'features/aave/types'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import type { FeaturesEnum } from 'types/config'

export type ProductTypeConfig = {
  featureToggle: FeaturesEnum | undefined
  additionalManageActions?: {
    action: ManagePositionAvailableActions
    featureToggle: FeaturesEnum | undefined
  }[]
  defaultSlippage?: BigNumber
}

export type TokenPairConfig = {
  collateral: string
  debt: string
  strategyType: StrategyType
  productTypes: Partial<Record<ProductType, ProductTypeConfig>>
}

export type TokenDepositConfig = {
  deposit: string
  strategyType: StrategyType
  networkId: NetworkIds
  protocol: AaveLendingProtocol | SparkLendingProtocol
  productTypes: Partial<Record<ProductType, ProductTypeConfig>>
}

export function hasMultiplyProductType(
  config: TokenPairConfig,
): config is TokenPairConfig & { productTypes: { [ProductType.Multiply]: ProductTypeConfig } } {
  return config.productTypes.Multiply !== undefined
}

export function hasBorrowProductType(
  config: TokenPairConfig,
): config is TokenPairConfig & { productTypes: { [ProductType.Borrow]: ProductTypeConfig } } {
  return config.productTypes.Borrow !== undefined
}

export function hasEarnProductType(
  config: TokenPairConfig,
): config is TokenPairConfig & { productTypes: { [ProductType.Earn]: ProductTypeConfig } } {
  return config.productTypes.Earn !== undefined
}
