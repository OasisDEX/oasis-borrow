import { MULTIPLY_VAULT_PILL_CHANGE_SUBJECT,MultiplyPillChange } from 'features/automation/protection/common/UITypes/MultiplyVaultPillChange'
import { useUIChanges } from 'helpers/uiChangesHook'
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

  const [uiState] = useUIChanges<MultiplyPillChange>(MULTIPLY_VAULT_PILL_CHANGE_SUBJECT)
  const isCloseVault = !!uiState && uiState.currentStage === 'closeVault'

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
