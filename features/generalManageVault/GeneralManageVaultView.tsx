import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ManageVaultContainer } from 'features/manageVault/ManageVaultView'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import React, { ReactNode } from 'react'
import { Container } from 'theme-ui'

import { DefaultManageMultiplyVaultContainer } from '../openMultiplyVault/variants/default/manage/DefaultManageMultiplyVaultContainer'
import { GuniManageMultiplyVaultCointainer } from '../openMultiplyVault/variants/guni/manage/GuniManageMultiplyVaultCointainer'
import { VaultType } from './vaultType'

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
              const multiplyContainerMap: Record<string, ReactNode> = {
                'GUNIV3DAIUSDC1-A': (
                  <GuniManageMultiplyVaultCointainer
                    vaultHistory={vaultMultiplyHistory}
                    manageVault={generalManageVault.state}
                  />
                ),
                'GUNIV3DAIUSDC2-A': (
                  <GuniManageMultiplyVaultCointainer
                    vaultHistory={vaultMultiplyHistory}
                    manageVault={generalManageVault.state}
                  />
                ),
              }
              return (
                <Container variant="vaultPageContainer">
                  {multiplyContainerMap[vaultIlk] ? (
                    multiplyContainerMap[vaultIlk]
                  ) : (
                    <DefaultManageMultiplyVaultContainer
                      vaultHistory={vaultMultiplyHistory}
                      manageVault={generalManageVault.state}
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
