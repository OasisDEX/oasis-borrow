import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

import { IlkData } from '../../../blockchain/ilks'
import { Vault } from '../../../blockchain/vaults'
import { useAppContext } from '../../../components/AppContextProvider'
import { VaultFormContainer } from '../../../components/vault/VaultFormContainer'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../../helpers/observableHook'
import { CollateralPricesWithFilters } from '../../collateralPrices/collateralPricesWithFilters'
import { accountIsConnectedValidator } from '../../form/commonValidators'
import {
  AutomationFromKind,
  PROTECTION_MODE_CHANGE_SUBJECT,
  ProtectionModeChange,
} from '../common/UITypes/ProtectionFormModeChange'
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
  const { txHelpers$, context$, uiChanges } = useAppContext()

  const [txHelpers, txHelpersError] = useObservable(txHelpers$)
  const [context, contextError] = useObservable(context$)

  const [currentForm] = useUIChanges<ProtectionModeChange>(PROTECTION_MODE_CHANGE_SUBJECT)

  const accountIsConnected = accountIsConnectedValidator({ account })
  const accountIsController = accountIsConnected && account === vault.controller

  return (
    <WithErrorHandler error={[contextError, txHelpersError]}>
      <WithLoadingIndicator value={[context]} customLoader={<VaultContainerSpinner />}>
        {([context]) => (
          <VaultFormContainer toggleTitle="Edit Vault">
            {currentForm?.currentMode === AutomationFromKind.CANCEL ? (
              <CancelSlFormControl
                vault={vault}
                ilkData={ilkData}
                triggerData={automationTriggersData}
                tx={txHelpers}
                ctx={context}
                accountIsController={accountIsController}
                toggleForms={() => {
                  uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
                    currentMode: AutomationFromKind.ADJUST,
                    type: 'change-mode',
                  })
                }}
                collateralPrice={collateralPrices}
              />
            ) : (
              <AdjustSlFormControl
                vault={vault}
                collateralPrice={collateralPrices}
                ilkData={ilkData}
                triggerData={automationTriggersData}
                tx={txHelpers}
                ctx={context}
                accountIsController={accountIsController}
                toggleForms={() => {
                  uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
                    type: 'change-mode',
                    currentMode: AutomationFromKind.CANCEL,
                  })
                }}
              />
            )}
          </VaultFormContainer>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
