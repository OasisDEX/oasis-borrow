import React from 'react'

import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { VaultHistoryDetailsControl } from '../../features/vaultHistory/VaultHistoryDetailsControl'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import { useAppContext } from '../AppContextProvider'
import { DefaultVaultLayout } from './DefaultVaultLayout'
import { GeneralVaultFormControl } from './GeneralVaultFormControl'

interface HistoryControlProps {
  generalManageVault: GeneralManageVaultState
}

export function HistoryControl({ generalManageVault }: HistoryControlProps) {
  const { vaultHistory$, vaultMultiplyHistory$ } = useAppContext()
  const vaultHistory = useObservable(vaultHistory$(generalManageVault.state.vault.id))
  const vaultMultiplyHistory = useObservable(
    vaultMultiplyHistory$(generalManageVault.state.vault.id),
  )

  return (
    <WithErrorHandler error={[vaultHistory.error, vaultMultiplyHistory.error]}>
      <WithLoadingIndicator
        value={[vaultHistory.value, vaultMultiplyHistory.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([vaultHistory, vaultMultiplyHistory]) => {
          return (
            <DefaultVaultLayout
              detailsViewControl={
                <VaultHistoryDetailsControl
                  vaultHistory={vaultHistory}
                  vaultMultiplyHistory={vaultMultiplyHistory}
                  vaultType={generalManageVault.type}
                />
              }
              editForm={<GeneralVaultFormControl generalManageVault={generalManageVault} />}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
