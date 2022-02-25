import { BigNumber } from 'bignumber.js'
import { ManageVaultContainer } from 'features/borrow/manage/containers/ManageVaultView'
import React from 'react'
import { Container } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ManageMultiplyVaultContainer } from '../../components/vault/commonMultiply/ManageMultiplyVaultContainer'
import { DefaultVaultHeader } from '../../components/vault/DefaultVaultHeader'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../helpers/observableHook'
import { GuniVaultHeader } from '../earn/guni/common/GuniVaultHeader'
import { GuniManageMultiplyVaultDetails } from '../earn/guni/manage/containers/GuniManageMultiplyVaultDetails'
import { GuniManageMultiplyVaultForm } from '../earn/guni/manage/containers/GuniManageMultiplyVaultForm'
import { ManageMultiplyVaultDetails } from '../multiply/manage/containers/ManageMultiplyVaultDetails'
import { ManageMultiplyVaultForm } from '../multiply/manage/containers/ManageMultiplyVaultForm'
import { VaultHistoryView } from '../vaultHistory/VaultHistoryView'
import { GeneralManageVaultState } from './generalManageVault'
import { VaultType } from './vaultType'

interface GeneralManageVaultViewProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralManageVaultViewAutomation({
  generalManageVault,
}: GeneralManageVaultViewProps) {
  switch (generalManageVault.type) {
    case VaultType.Borrow:
      return (
        <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
          <ManageVaultContainer manageVault={generalManageVault.state} vaultHistory={[]} />
        </Container>
      )
    case VaultType.Multiply:
      const vaultIlk = generalManageVault.state.ilkData.ilk
      return (
        <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
          {['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(vaultIlk) ? (
            <ManageMultiplyVaultContainer
              manageVault={generalManageVault.state}
              details={GuniManageMultiplyVaultDetails}
              header={GuniVaultHeader}
              form={GuniManageMultiplyVaultForm}
              history={VaultHistoryView}
              vaultHistory={[]}
            />
          ) : (
            <ManageMultiplyVaultContainer
              manageVault={generalManageVault.state}
              header={DefaultVaultHeader}
              details={ManageMultiplyVaultDetails}
              form={ManageMultiplyVaultForm}
              history={VaultHistoryView}
              vaultHistory={[]}
            />
          )}
        </Container>
      )
  }
}

export function GeneralManageVaultView({ id }: { id: BigNumber }) {
  const { generalManageVault$, vaultHistory$, vaultMultiplyHistory$ } = useAppContext()
  const manageVaultWithId$ = generalManageVault$(id)
  const manageVaultWithError = useObservableWithError(manageVaultWithId$)
  const vaultHistoryWithError = useObservableWithError(vaultHistory$(id))
  const vaultMultiplyHistoryWithError = useObservableWithError(vaultMultiplyHistory$(id))

  return (
    <WithErrorHandler
      error={[
        manageVaultWithError.error,
        vaultHistoryWithError.error,
        vaultMultiplyHistoryWithError.error,
      ]}
    >
      <WithLoadingIndicator
        value={[
          manageVaultWithError.value,
          vaultHistoryWithError.value,
          vaultMultiplyHistoryWithError.value,
        ]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault, vaultHistory, vaultMultiplyHistory]) => {
          switch (generalManageVault.type) {
            case VaultType.Borrow:
              return (
                <Container variant="vaultPageContainer">
                  <ManageVaultContainer
                    vaultHistory={vaultHistory}
                    manageVault={generalManageVault.state}
                  />
                </Container>
              )
            case VaultType.Multiply:
              const vaultIlk = generalManageVault.state.ilkData.ilk

              return (
                <Container variant="vaultPageContainer">
                  {['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(vaultIlk) ? (
                    <ManageMultiplyVaultContainer
                      manageVault={generalManageVault.state}
                      details={GuniManageMultiplyVaultDetails}
                      header={GuniVaultHeader}
                      form={GuniManageMultiplyVaultForm}
                      history={VaultHistoryView}
                      vaultHistory={vaultMultiplyHistory}
                    />
                  ) : (
                    <ManageMultiplyVaultContainer
                      vaultHistory={vaultMultiplyHistory}
                      manageVault={generalManageVault.state}
                      header={DefaultVaultHeader}
                      details={ManageMultiplyVaultDetails}
                      form={ManageMultiplyVaultForm}
                      history={VaultHistoryView}
                    />
                  )}
                </Container>
              )
          }
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
