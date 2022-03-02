import React from 'react'

import { ManageVaultForm } from '../../features/borrow/manage/containers/ManageVaultForm'
import { GuniManageMultiplyVaultForm } from '../../features/earn/guni/manage/containers/GuniManageMultiplyVaultForm'
import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { VaultType } from '../../features/generalManageVault/vaultType'
import { ManageMultiplyVaultForm } from '../../features/multiply/manage/containers/ManageMultiplyVaultForm'

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
        <GuniManageMultiplyVaultForm {...generalManageVault.state} />
      ) : (
        <ManageMultiplyVaultForm {...generalManageVault.state} />
      )
    default:
      return null
  }
}
