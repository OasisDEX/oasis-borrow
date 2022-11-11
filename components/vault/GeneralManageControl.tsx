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
  const [generalManageVaultData, generalManageVaultError] = useObservable(generalManageVaultWithId$)
  const [contextData, contextError] = useObservable(context$)

  useEffect(() => {
    return () => {
      generalManageVaultData?.state.clear()
    }
  }, [])

  const vaultHistoryCheck = generalManageVaultData?.state.vaultHistory.length || undefined

  return (
    <WithErrorHandler error={[generalManageVaultError, contextError]}>
      <WithLoadingIndicator
        value={[generalManageVaultData, contextData, vaultHistoryCheck]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault, context]) => (
          <ContextLayerControl generalManageVault={generalManageVault} context={context}>
            <GeneralManageLayout generalManageVault={generalManageVault} />
          </ContextLayerControl>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
