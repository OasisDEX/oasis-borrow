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
  const { generalManageVault$, automationTriggersData$ } = useAppContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const [generalManageVault, generalManageVaultError] = useObservable(generalManageVaultWithId$)
  const autoTriggersData$ = automationTriggersData$(id)
  const [autoTriggersData, autoTriggersDataError] = useObservable(autoTriggersData$)

  useEffect(() => {
    return () => {
      generalManageVault?.state.clear()
    }
  }, [])

  return (
    <WithErrorHandler error={[generalManageVaultError, autoTriggersDataError]}>
      <WithLoadingIndicator
        value={[generalManageVault, autoTriggersData]}
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
