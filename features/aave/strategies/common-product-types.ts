import type { ProductTypeConfig } from 'features/aave/strategies/common'
import { ProductType } from 'features/aave/types'

export const borrowAndMultiply: Partial<Record<ProductType, ProductTypeConfig>> = {
  [ProductType.Borrow]: {
    featureToggle: undefined,
    additionalManageActions: [
      {
        action: 'switch-to-multiply',
        featureToggle: undefined,
      },
    ],
  },
  [ProductType.Multiply]: {
    featureToggle: undefined,
    additionalManageActions: [
      {
        action: 'switch-to-borrow',
        featureToggle: undefined,
      },
    ],
  },
}
