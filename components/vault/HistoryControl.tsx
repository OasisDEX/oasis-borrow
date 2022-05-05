import React from 'react'

import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { VaultHistoryView } from '../../features/vaultHistory/VaultHistoryView'
import { DefaultVaultLayout } from './DefaultVaultLayout'
import { GeneralVaultFormControl } from './GeneralVaultFormControl'

interface HistoryControlProps {
  generalManageVault: GeneralManageVaultState
}

export function HistoryControl({ generalManageVault }: HistoryControlProps) {
  return (
    <DefaultVaultLayout
      detailsViewControl={<VaultHistoryView vaultHistory={generalManageVault.state.vaultHistory} />}
      editForm={<GeneralVaultFormControl generalManageVault={generalManageVault} />}
    />
  )
}
