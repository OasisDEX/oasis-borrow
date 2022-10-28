import { BigNumber } from 'bignumber.js'
import { ContextLayerControl } from 'components/vault/ContextLayerControl'
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
  const { generalManageVault$, context$ } = useAppContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const [generalManageVault, generalManageVaultError] = useObservable(generalManageVaultWithId$)
  const [contextValue, contextError] = useObservable(context$)

  useEffect(() => {
    return () => {
      generalManageVault?.state.clear()
    }
  }, [])

  const vaultHistoryCheck = generalManageVault?.state.vaultHistory.length || undefined

  return (
    <WithErrorHandler error={[generalManageVaultError, contextError]}>
      <WithLoadingIndicator
        value={[generalManageVault, contextValue, vaultHistoryCheck]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault, contextValue]) => (
          <ContextLayerControl generalManageVault={generalManageVault} context={contextValue}>
            <GeneralManageLayout generalManageVault={generalManageVault} />
          </ContextLayerControl>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
