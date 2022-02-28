import { BigNumber } from 'bignumber.js'
import React from 'react'

import { VaultContainerSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../helpers/observableHook'
import { useAppContext } from '../AppContextProvider'
import { GeneralManageLayout } from './GeneralManageLayout'

interface GeneralManageControlProps {
  id: BigNumber
}

export function GeneralManageControl({ id }: GeneralManageControlProps) {
  const { generalManageVault$ } = useAppContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const generalManageVaultWithError = useObservableWithError(generalManageVaultWithId$)

  return (
    <WithErrorHandler error={[generalManageVaultWithError.error]}>
      <WithLoadingIndicator
        value={[generalManageVaultWithError.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault]) => <GeneralManageLayout generalManageVault={generalManageVault} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
