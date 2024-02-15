import { ProductType } from 'features/aave/types'
import { OmniProductType } from 'features/omni-kit/types'

export const aaveOmniProductType = (product: ProductType) =>
  ({
    [ProductType.Borrow.toLocaleLowerCase()]: OmniProductType.Borrow,
    [ProductType.Earn.toLocaleLowerCase()]: OmniProductType.Earn,
    [ProductType.Multiply.toLocaleLowerCase()]: OmniProductType.Multiply,
  }[product.toLocaleLowerCase()])
