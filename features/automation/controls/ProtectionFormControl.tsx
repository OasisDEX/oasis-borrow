import React, { useCallback, useState } from 'react'

import { IlkData } from '../../../blockchain/ilks'
import { Vault } from '../../../blockchain/vaults'
import { useAppContext } from '../../../components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../../helpers/observableHook'
import { CollateralPricesWithFilters } from '../../collateralPrices/collateralPricesWithFilters'
import { accountIsConnectedValidator } from '../../form/commonValidators'
import { AutomationFromKind } from '../common/enums/TriggersTypes'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { AdjustSlFormControl } from './AdjustSlFormControl'
import { CancelSlFormControl } from './CancelSlFormControl'
import { ProtectionFormLayout } from './ProtectionFormLayout'

interface Props {
  ilkData: IlkData
  automationTriggersData: TriggersData
  collateralPrices: CollateralPricesWithFilters
  vault: Vault
  account?: string
}

export function ProtectionFormControl({
  ilkData,
  automationTriggersData,
  collateralPrices,
  vault,
  account,
}: Props) {
  const { txHelpers$, context$ } = useAppContext()

  const txHelpersWithError = useObservableWithError(txHelpers$)
  const contextWithError = useObservableWithError(context$)

  const [currentForm, setForm] = useState(AutomationFromKind.ADJUST)

  const toggleForms = useCallback(() => {
    setForm((prevState) =>
      prevState === AutomationFromKind.ADJUST
        ? AutomationFromKind.CANCEL
        : AutomationFromKind.ADJUST,
    )
  }, [currentForm])

  const { isAutomationEnabled } = automationTriggersData
  const accountIsConnected = accountIsConnectedValidator({ account })
  const accountIsController = accountIsConnected && account === vault.controller

  return (
    <WithErrorHandler error={[contextWithError.error]}>
      <WithLoadingIndicator
        value={[contextWithError.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([context]) => (
          <ProtectionFormLayout
            currentForm={currentForm}
            toggleForm={toggleForms}
            showButton={accountIsController && isAutomationEnabled}
          >
            {currentForm === AutomationFromKind.ADJUST ? (
              <AdjustSlFormControl
                vault={vault}
                collateralPrice={collateralPrices}
                ilkData={ilkData}
                triggerData={automationTriggersData}
                tx={txHelpersWithError.value}
                ctx={context}
                accountIsController={accountIsController}
              />
            ) : (
              <CancelSlFormControl
                vault={vault}
                ilkData={ilkData}
                triggerData={automationTriggersData}
                tx={txHelpersWithError.value}
                ctx={context}
              />
            )}
          </ProtectionFormLayout>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
