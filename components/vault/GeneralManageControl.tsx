import { BigNumber } from 'bignumber.js'
import React from 'react'

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
  const generalManageVault = useObservable(generalManageVaultWithId$)

  return (
    <WithErrorHandler error={[generalManageVault.error]}>
      <WithLoadingIndicator
        value={[generalManageVault.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault]) => <GeneralManageLayout generalManageVault={generalManageVault} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
