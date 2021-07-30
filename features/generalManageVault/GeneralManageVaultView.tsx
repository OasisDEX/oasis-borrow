import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ManageMultiplyVaultContainer } from 'features/manageMultiplyVault/components/ManageMultiplyVaultView'
import { ManageVaultContainer } from 'features/manageVault/ManageVaultView'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'
import { Container } from 'theme-ui'

import { VaultType } from './generalManageVault'

export function GeneralManageVaultView({ id }: { id: BigNumber }) {
  const { generalManageVault$, vaultHistory$ } = useAppContext()
  const manageVaultWithId$ = generalManageVault$(id)
  const manageVaultWithError = useObservableWithError(manageVaultWithId$)
  const vaultHistoryWithError = useObservableWithError(vaultHistory$(id))

  // TO DO bring back analytics
  // useEffect(() => {
  //   const subscription = createManageVaultAnalytics$(manageVaultWithId$, trackingEvents).subscribe()

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

  return (
    <WithLoadingIndicator
      value={[manageVaultWithError.value, vaultHistoryWithError.value]}
      error={[manageVaultWithError.error, vaultHistoryWithError.error]}
      customLoader={<VaultContainerSpinner />}
    >
      {([generalManageVault, vaultHistory]) => {
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
                  vaultHistory={vaultHistory}
                  manageVault={generalManageVault.state}
                />
              </Container>
            )
        }
      }}
    </WithLoadingIndicator>
  )
}
