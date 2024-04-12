import { VaultType } from 'features/generalManageVault/vaultType.types'
import { PositionType } from 'summerfi-sdk-common'

export const vaultTypeToSDKType = (vaultType: VaultType): PositionType | undefined => {
  switch (vaultType) {
    case VaultType.Borrow:
      return PositionType.Borrow
    case VaultType.Multiply:
      return PositionType.Multiply
    default:
      return undefined
  }
}
