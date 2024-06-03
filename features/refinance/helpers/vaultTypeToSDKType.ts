import { PositionType } from '@summer_fi/summerfi-sdk-common'
import { VaultType } from 'features/generalManageVault/vaultType.types'

export const vaultTypeToSDKType = (vaultType: VaultType): PositionType => {
  switch (vaultType) {
    case VaultType.Borrow:
      return PositionType.Borrow
    case VaultType.Multiply:
      return PositionType.Multiply
    case VaultType.Earn:
      return PositionType.Earn
    default:
      throw new Error(`Unknown vault type: ${vaultType}`)
  }
}
