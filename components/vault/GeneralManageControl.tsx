import { BigNumber } from 'bignumber.js'
import React, { useEffect } from 'react'

import { VaultContainerSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
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

  return (
    <WithErrorHandler error={[generalManageVaultError]}>
      <WithLoadingIndicator value={[generalManageVault]} customLoader={<VaultContainerSpinner />}>
        {([generalManageVault]) => <GeneralManageLayout generalManageVault={generalManageVault} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
