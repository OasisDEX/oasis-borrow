import { ProductType } from 'features/aave/types'
import { VaultType } from 'features/generalManageVault/vaultType'

export function productToVaultType(productType: ProductType) {
  return productType === 'Borrow'
    ? VaultType.Borrow
    : productType === 'Multiply'
    ? VaultType.Multiply
    : productType === 'Earn'
    ? VaultType.Earn
    : undefined
}
