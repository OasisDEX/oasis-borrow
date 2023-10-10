import { ManageMultiplyVaultContainer } from 'components/vault/commonMultiply/ManageMultiplyVaultContainer'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { ManageEarnVaultContainer } from 'components/vault/earn/ManageEarnVaultContainer'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { GuniManageMultiplyVaultDetails } from 'features/earn/guni/manage/containers/GuniManageMultiplyVaultDetails'
import { SidebarManageGuniVault } from 'features/earn/guni/manage/sidebars/SidebarManageGuniVault'
import { ManageMultiplyVaultDetails } from 'features/multiply/manage/containers/ManageMultiplyVaultDetails'
import { SidebarManageMultiplyVault } from 'features/multiply/manage/sidebars/SidebarManageMultiplyVault'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import React from 'react'
import { Container } from 'theme-ui'

import type { GeneralManageVaultState } from './generalManageVault.types'
import { VaultType } from './vaultType.types'

interface GeneralManageVaultViewProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralManageVaultViewAutomation({
  generalManageVault,
}: GeneralManageVaultViewProps) {
  const vaultType = generalManageVault.type

  switch (vaultType) {
    case VaultType.Borrow:
    case VaultType.Multiply:
      return (
        <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
          <ManageMultiplyVaultContainer
            manageVault={generalManageVault.state}
            header={DefaultVaultHeader}
            details={ManageMultiplyVaultDetails}
            form={SidebarManageMultiplyVault}
            history={VaultHistoryView}
          />
        </Container>
      )
    case VaultType.Earn:
      return (
        <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
          <ManageEarnVaultContainer
            manageVault={generalManageVault.state}
            details={GuniManageMultiplyVaultDetails}
            header={GuniVaultHeader}
            form={SidebarManageGuniVault}
            history={VaultHistoryView}
          />
        </Container>
      )

    default:
      throw new Error(
        `could not render GeneralManageVaultViewAutomation for vault type ${vaultType}`,
      )
  }
}
