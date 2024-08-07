import { LendingPositionType } from '@summer_fi/summerfi-sdk-common'
import { VaultType } from 'features/generalManageVault/vaultType.types'

export const vaultTypeToSDKType = (vaultType: VaultType): LendingPositionType => {
  switch (vaultType) {
    case VaultType.Borrow:
      return LendingPositionType.Borrow
    case VaultType.Multiply:
      return LendingPositionType.Multiply
    case VaultType.Earn:
      return LendingPositionType.Earn
    default:
      throw new Error(`Unknown vault type: ${vaultType}`)
  }
}
