import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { OptimizationDetailsControl } from 'features/automation/optimization/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'features/automation/optimization/controls/OptimizationFormControl'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React, { useMemo } from 'react'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface OptimizationControlProps {
  vault: Vault
}

export function OptimizationControl({ vault }: OptimizationControlProps) {
  const { automationTriggersData$, priceInfo$ } = useAppContext()
  const priceInfoObs$ = useMemo(() => priceInfo$(vault.token), [vault.token])
  const [priceInfoData, priceInfoError] = useObservable(priceInfoObs$)

  const autoTriggersData$ = automationTriggersData$(vault.id)
  const [automationTriggersData, automationTriggersError] = useObservable(autoTriggersData$)

  return (
    <WithErrorHandler error={[automationTriggersError, priceInfoError]}>
      <WithLoadingIndicator
        value={[automationTriggersData, priceInfoData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([automationTriggers, priceInfo]) => (
          <DefaultVaultLayout
            detailsViewControl={
              <OptimizationDetailsControl
                vault={vault}
                automationTriggersData={automationTriggers}
                priceInfo={priceInfo}
              />
            }
            editForm={
              <OptimizationFormControl vault={vault} automationTriggersData={automationTriggers} />
            }
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
