import React, { useCallback, useState } from 'react'

import { IlkData } from '../../../blockchain/ilks'
import { Vault } from '../../../blockchain/vaults'
import { useAppContext } from '../../../components/AppContextProvider'
import { VaultFormContainer } from '../../../components/vault/VaultFormContainer'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../../helpers/observableHook'
import { CollateralPricesWithFilters } from '../../collateralPrices/collateralPricesWithFilters'
import { accountIsConnectedValidator } from '../../form/commonValidators'
import { AutomationFromKind } from '../common/enums/TriggersTypes'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { AdjustSlFormControl } from './AdjustSlFormControl'
import { CancelSlFormControl } from './CancelSlFormControl'

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

  const [txHelpers, txHelpersError] = useObservable(txHelpers$)
  const [context, contextError] = useObservable(context$)

  const [currentForm, setForm] = useState(AutomationFromKind.ADJUST)

  const toggleForms = useCallback(() => {
    setForm((prevState) =>
      prevState === AutomationFromKind.ADJUST
        ? AutomationFromKind.CANCEL
        : AutomationFromKind.ADJUST,
    )
  }, [currentForm])

  const accountIsConnected = accountIsConnectedValidator({ account })
  const accountIsController = accountIsConnected && account === vault.controller

  return (
    <WithErrorHandler error={[contextError, txHelpersError]}>
      <WithLoadingIndicator value={[context]} customLoader={<VaultContainerSpinner />}>
        {([context]) => (
          <VaultFormContainer toggleTitle="Edit Vault">
            {currentForm === AutomationFromKind.ADJUST ? (
              <AdjustSlFormControl
                vault={vault}
                collateralPrice={collateralPrices}
                ilkData={ilkData}
                triggerData={automationTriggersData}
                tx={txHelpers}
                ctx={context}
                accountIsController={accountIsController}
                toggleForms={toggleForms}
              />
            ) : (
              <CancelSlFormControl
                vault={vault}
                ilkData={ilkData}
                triggerData={automationTriggersData}
                tx={txHelpers}
                ctx={context}
                accountIsController={accountIsController}
                toggleForms={toggleForms}
                collateralPrice={collateralPrices}
              />
            )}
          </VaultFormContainer>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
