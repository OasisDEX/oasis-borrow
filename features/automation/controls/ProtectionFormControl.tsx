import React, { useCallback, useState } from 'react'
import { startWith } from 'rxjs/operators'

import { IlkDataList } from '../../../blockchain/ilks'
import { Vault } from '../../../blockchain/vaults'
import { TxHelpers } from '../../../components/AppContext'
import { useAppContext } from '../../../components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../../helpers/observableHook'
import { CollateralPricesWithFilters } from '../../collateralPrices/collateralPricesWithFilters'
import { AutomationFromKind } from '../common/enums/TriggersTypes'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { AdjustSlFormControl } from './AdjustSlFormControl'
import { CancelSlFormControl } from './CancelSlFormControl'
import { ProtectionFormLayout } from './ProtectionFormLayout'

interface Props {
  ilkDataList: IlkDataList
  automationTriggersData: TriggersData
  collateralPrices: CollateralPricesWithFilters
  vault: Vault
}

export function ProtectionFormControl({
  ilkDataList,
  automationTriggersData,
  collateralPrices,
  vault,
}: Props) {
  const { txHelpers$, context$ } = useAppContext()

  const txHelpersWithError = useObservableWithError(
    txHelpers$.pipe(startWith<TxHelpers | undefined>(undefined)),
  )
  const contextWithError = useObservableWithError(context$)

  const [currentForm, setForm] = useState(AutomationFromKind.ADJUST)

  const toggleForms = useCallback(() => {
    setForm((prevState) =>
      prevState === AutomationFromKind.ADJUST
        ? AutomationFromKind.CANCEL
        : AutomationFromKind.ADJUST,
    )
  }, [currentForm])

  return (
    <WithErrorHandler error={[contextWithError.error]}>
      <WithLoadingIndicator
        value={[contextWithError.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([context]) => (
          <ProtectionFormLayout currentForm={currentForm} toggleForm={toggleForms}>
            {currentForm === AutomationFromKind.ADJUST ? (
              <AdjustSlFormControl
                vault={vault}
                collateralPrice={collateralPrices}
                ilksData={ilkDataList}
                triggerData={automationTriggersData}
                tx={txHelpersWithError.value}
                ctx={context}
              />
            ) : (
              <CancelSlFormControl
                vault={vault}
                collateralPrice={collateralPrices}
                ilksData={ilkDataList}
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
