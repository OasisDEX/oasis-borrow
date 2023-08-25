import { ManagePositionAvailableActions, ProductType, StrategyType } from 'features/aave/types'
import { Feature } from 'helpers/useFeatureToggle'

export type ProductTypeConfig = {
  featureToggle: Feature | undefined
  additionalManageActions?: {
    action: ManagePositionAvailableActions
    featureToggle: Feature | undefined
  }[]
}

export type TokenPairConfig = {
  collateral: string
  debt: string
  strategyType: StrategyType
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
