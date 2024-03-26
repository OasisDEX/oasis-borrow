import { VaultType } from 'features/generalManageVault/vaultType.types'

export function productToVaultType(
  productType: 'Borrow' | 'Multiply' | 'Earn',
): VaultType | undefined {
  return productType === 'Borrow'
    ? VaultType.Borrow
    : productType === 'Multiply'
      ? VaultType.Multiply
      : productType === 'Earn'
        ? VaultType.Earn
        : undefined
}
