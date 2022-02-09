import { ManageVaultContainer } from 'features/borrow/manage/containers/ManageVaultView'
import React, { ReactNode } from 'react'
import { Container } from 'theme-ui'

import { ManageMultiplyVaultContainer } from '../../components/vault/commonMultiply/ManageMultiplyVaultContainer'
import { GuniManageMultiplyVaultDetails } from '../earn/guni/manage/containers/GuniManageMultiplyVaultDetails'
import { GuniManageMultiplyVaultForm } from '../earn/guni/manage/containers/GuniManageMultiplyVaultForm'
import { ManageMultiplyVaultDetails } from '../multiply/manage/containers/ManageMultiplyVaultDetails'
import { ManageMultiplyVaultForm } from '../multiply/manage/containers/ManageMultiplyVaultForm'
import { GeneralManageVaultState } from './generalManageVault'
import { VaultType } from './vaultType'

interface GeneralManageVaultViewProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralManageVaultView({ generalManageVault }: GeneralManageVaultViewProps) {
  switch (generalManageVault.type) {
    case VaultType.Borrow:
      return (
        <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
          <ManageVaultContainer manageVault={generalManageVault.state} />
        </Container>
      )
    case VaultType.Multiply:
      const vaultIlk = generalManageVault.state.ilkData.ilk
      const multiplyContainerMap: Record<string, ReactNode> = {
        'GUNIV3DAIUSDC1-A': (
          <ManageMultiplyVaultContainer
            manageVault={generalManageVault.state}
            details={GuniManageMultiplyVaultDetails}
            form={GuniManageMultiplyVaultForm}
          />
        ),
        'GUNIV3DAIUSDC2-A': (
          <>
            <ManageMultiplyVaultContainer
              manageVault={generalManageVault.state}
              details={GuniManageMultiplyVaultDetails}
              form={GuniManageMultiplyVaultForm}
            />
          </>
        ),
      }
      return (
        <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
          {multiplyContainerMap[vaultIlk] ? (
            multiplyContainerMap[vaultIlk]
          ) : (
            <ManageMultiplyVaultContainer
              manageVault={generalManageVault.state}
              details={ManageMultiplyVaultDetails}
              form={ManageMultiplyVaultForm}
            />
          )}
        </Container>
      )
  }
}
