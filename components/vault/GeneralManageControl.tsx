import { BigNumber } from 'bignumber.js'
import { AutomationContextProvider } from 'components/AutomationContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React, { useEffect } from 'react'

import { useAppContext } from '../AppContextProvider'
import { GeneralManageLayout } from './GeneralManageLayout'

interface GeneralManageControlProps {
  id: BigNumber
}

export function GeneralManageControl({ id }: GeneralManageControlProps) {
  const { generalManageVault$ } = useAppContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const [generalManageVault, generalManageVaultError] = useObservable(generalManageVaultWithId$)

  useEffect(() => {
    return () => {
      generalManageVault?.state.clear()
    }
  }, [])

  const vaultHistoryCheck = generalManageVault?.state.vaultHistory.length || undefined

  return (
    <WithErrorHandler error={[generalManageVaultError]}>
      <WithLoadingIndicator
        value={[generalManageVault, vaultHistoryCheck]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault]) => (
          <AutomationContextProvider id={id}>
            <GeneralManageLayout generalManageVault={generalManageVault} />
          </AutomationContextProvider>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
