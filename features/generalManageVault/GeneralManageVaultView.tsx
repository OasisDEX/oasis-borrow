import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ManageMultiplyVaultContainer } from 'features/manageMultiplyVault/components/ManageMultiplyVaultView'
import { ManageVaultContainer } from 'features/manageVault/ManageVaultView'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'
import { Container } from 'theme-ui'

import { VaultType } from './generalManageVault'

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
              return (
                <Container variant="vaultPageContainer">
                  <ManageMultiplyVaultContainer
                    vaultHistory={vaultMultiplyHistory}
                    manageVault={generalManageVault.state}
                  />
                </Container>
              )
          }
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
