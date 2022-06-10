import { ManageVaultForm } from 'features/borrow/manage/containers/ManageVaultForm'
import { GuniManageMultiplyVaultForm } from 'features/earn/guni/manage/containers/GuniManageMultiplyVaultForm'
import { SidebarManageGuniVault } from 'features/earn/guni/manage/sidebars/SidebarManageGuniVault'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import { ManageMultiplyVaultForm } from 'features/multiply/manage/containers/ManageMultiplyVaultForm'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

interface GeneralVaultFormControlProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralVaultFormControl({ generalManageVault }: GeneralVaultFormControlProps) {
  const newComponentsEnabled = useFeatureToggle('NewComponents')
  switch (generalManageVault.type) {
    case VaultType.Borrow:
      return <ManageVaultForm {...generalManageVault.state} />
    case VaultType.Multiply:
      const vaultIlk = generalManageVault.state.ilkData.ilk

      return ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(vaultIlk) ? (
        !newComponentsEnabled ? (
          <GuniManageMultiplyVaultForm {...generalManageVault.state} />
        ) : (
          <SidebarManageGuniVault {...generalManageVault.state} />
        )
      ) : (
        <ManageMultiplyVaultForm {...generalManageVault.state} />
      )
    default:
      return null
  }
}
