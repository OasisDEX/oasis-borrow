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
  const { generalManageVault$, automationTriggersData$ } = useAppContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const generalManageVaultWithError = useObservableWithError(generalManageVaultWithId$)
  const autoTriggersData$ = automationTriggersData$(id)
  const autoTriggersDataWithError = useObservableWithError(autoTriggersData$)

  return (
    <WithErrorHandler error={[generalManageVaultWithError.error, autoTriggersDataWithError.error]}>
      <WithLoadingIndicator
        value={[generalManageVaultWithError.value, autoTriggersDataWithError.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault, autoTriggersData]) => (
          <GeneralManageLayout
            generalManageVault={generalManageVault}
            autoTriggersData={autoTriggersData}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
