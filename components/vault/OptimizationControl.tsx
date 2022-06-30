import { IlkData } from 'blockchain/ilks'
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
  ilkData: IlkData
}

export function OptimizationControl({ vault, ilkData }: OptimizationControlProps) {
  const { automationTriggersData$, priceInfo$, context$, txHelpers$ } = useAppContext()
  const priceInfoObs$ = useMemo(() => priceInfo$(vault.token), [vault.token])
  const [priceInfoData, priceInfoError] = useObservable(priceInfoObs$)
  const [txHelpersData] = useObservable(txHelpers$)
  const [contextData] = useObservable(context$)
  const autoTriggersData$ = automationTriggersData$(vault.id)
  const [automationTriggersData, automationTriggersError] = useObservable(autoTriggersData$)

  return (
    <WithErrorHandler error={[automationTriggersError, priceInfoError]}>
      <WithLoadingIndicator
        value={[automationTriggersData, priceInfoData, contextData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([automationTriggers, priceInfo, context]) => (
          <DefaultVaultLayout
            detailsViewControl={
              <OptimizationDetailsControl
                vault={vault}
                automationTriggersData={automationTriggers}
                priceInfo={priceInfo}
              />
            }
            editForm={
              <OptimizationFormControl
                vault={vault}
                automationTriggersData={automationTriggers}
                ilkData={ilkData}
                priceInfo={priceInfo}
                txHelpers={txHelpersData}
                context={context}
              />
            }
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
