import { ManageVaultForm } from 'features/borrow/manage/containers/ManageVaultForm'
import { SidebarManageGuniVault } from 'features/earn/guni/manage/sidebars/SidebarManageGuniVault'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import { ManageMultiplyVaultForm } from 'features/multiply/manage/containers/ManageMultiplyVaultForm'
import React from 'react'

interface GeneralVaultFormControlProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralVaultFormControl({ generalManageVault }: GeneralVaultFormControlProps) {
  switch (generalManageVault.type) {
    case VaultType.Borrow:
      return <ManageVaultForm {...generalManageVault.state} />
    case VaultType.Multiply:
      const vaultIlk = generalManageVault.state.ilkData.ilk

      return ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(vaultIlk) ? (
        <SidebarManageGuniVault {...generalManageVault.state} />
      ) : (
        <ManageMultiplyVaultForm {...generalManageVault.state} />
      )
    default:
      return null
  }
}
