import React from 'react'

import { IlkData } from '../../blockchain/ilks'
import { Vault } from '../../blockchain/vaults'
import { ProtectionDetailsControl } from '../../features/automation/controls/ProtectionDetailsControl'
import { ProtectionFormControl } from '../../features/automation/controls/ProtectionFormControl'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../helpers/observableHook'
import { useAppContext } from '../AppContextProvider'
import { DefaultVaultLayout } from './DefaultVaultLayout'

interface ProtectionControlProps {
  vault: Vault
  ilkData: IlkData
}

export function ProtectionControl({ vault, ilkData }: ProtectionControlProps) {
  const { automationTriggersData$, collateralPrices$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(vault.id)
  const automationTriggersDataWithError = useObservableWithError(autoTriggersData$)
  const collateralPricesWithError = useObservableWithError(collateralPrices$)

  return (
    <WithErrorHandler
      error={[automationTriggersDataWithError.error, collateralPricesWithError.error]}
    >
      <WithLoadingIndicator
        value={[automationTriggersDataWithError.value, collateralPricesWithError.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([automationTriggersData, collateralPrices]) => {
          return (
            <DefaultVaultLayout
              detailsViewControl={
                <ProtectionDetailsControl
                  vault={vault}
                  automationTriggersData={automationTriggersData}
                  collateralPrices={collateralPrices}
                  ilkData={ilkData}
                />
              }
              editForm={
                <ProtectionFormControl
                  ilkData={ilkData}
                  automationTriggersData={automationTriggersData}
                  collateralPrices={collateralPrices}
                  vault={vault}
                />
              }
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
