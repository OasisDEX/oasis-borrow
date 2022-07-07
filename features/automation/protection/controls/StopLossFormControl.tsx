import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers, UIChanges } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { useSharedUI } from 'components/SharedUIProvider'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { accountIsConnectedValidator } from 'features/form/commonValidators'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { useEffect } from 'react'

import {
  AutomationFromKind,
  PROTECTION_MODE_CHANGE_SUBJECT,
  ProtectionModeChange,
} from '../common/UITypes/ProtectionFormModeChange'
import { AdjustSlFormControl } from './AdjustSlFormControl'
import { CancelSlFormControl } from './CancelSlFormControl'

interface StopLossFormsProps {
  context: Context
  currentForm: ProtectionModeChange
  vault: Vault
  ilkData: IlkData
  uiChanges: UIChanges
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  accountIsController: boolean
  stopLossTriggerData: StopLossTriggerData
  txHelpers?: TxHelpers
}

function StopLossForms({
  context,
  currentForm,
  vault,
  ilkData,
  uiChanges,
  priceInfo,
  balanceInfo,
  txHelpers,
  accountIsController,
  stopLossTriggerData,
}: StopLossFormsProps) {
  return currentForm?.currentMode === AutomationFromKind.CANCEL ? (
    <CancelSlFormControl
      vault={vault}
      ilkData={ilkData}
      triggerData={stopLossTriggerData}
      tx={txHelpers}
      ctx={context}
      accountIsController={accountIsController}
      toggleForms={() => {
        uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
          currentMode: AutomationFromKind.ADJUST,
          type: 'change-mode',
        })
      }}
      priceInfo={priceInfo}
      balanceInfo={balanceInfo}
    />
  ) : (
    <AdjustSlFormControl
      vault={vault}
      priceInfo={priceInfo}
      ilkData={ilkData}
      triggerData={stopLossTriggerData}
      tx={txHelpers}
      ctx={context}
      accountIsController={accountIsController}
      toggleForms={() => {
        uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
          type: 'change-mode',
          currentMode: AutomationFromKind.CANCEL,
        })
      }}
      balanceInfo={balanceInfo}
    />
  )
}

interface StopLossFormControlProps {
  ilkData: IlkData
  stopLossTriggerData: StopLossTriggerData
  priceInfo: PriceInfo
  vault: Vault
  balanceInfo: BalanceInfo
  isStopLossActive: boolean
  account?: string
}

export function StopLossFormControl({
  ilkData,
  stopLossTriggerData,
  priceInfo,
  vault,
  account,
  isStopLossActive,
  balanceInfo,
}: StopLossFormControlProps) {
  const { txHelpers$, context$, uiChanges } = useAppContext()
  const { setVaultFormOpened } = useSharedUI()
  const isTouchDevice = window && 'ontouchstart' in window

  const basicBSEnabled = useFeatureToggle('BasicBS')

  useEffect(() => {
    if (isTouchDevice && !stopLossTriggerData.isStopLossEnabled) {
      setVaultFormOpened(true)
    }
  }, [])

  const [txHelpers, txHelpersError] = useObservable(txHelpers$)
  const [context, contextError] = useObservable(context$)

  const [currentForm] = useUIChanges<ProtectionModeChange>(PROTECTION_MODE_CHANGE_SUBJECT)

  const accountIsConnected = accountIsConnectedValidator({ account })
  const accountIsController = accountIsConnected && account === vault.controller

  return (
    <WithErrorHandler error={[contextError, txHelpersError]}>
      <WithLoadingIndicator value={[context]} customLoader={<VaultContainerSpinner />}>
        {([context]) =>
          basicBSEnabled ? (
            isStopLossActive ? (
              <StopLossForms
                currentForm={currentForm}
                txHelpers={txHelpers}
                context={context}
                vault={vault}
                ilkData={ilkData}
                uiChanges={uiChanges}
                priceInfo={priceInfo}
                balanceInfo={balanceInfo}
                accountIsController={accountIsController}
                stopLossTriggerData={stopLossTriggerData}
              />
            ) : (
              <></>
            )
          ) : (
            <StopLossForms
              currentForm={currentForm}
              txHelpers={txHelpers}
              context={context}
              vault={vault}
              ilkData={ilkData}
              uiChanges={uiChanges}
              priceInfo={priceInfo}
              balanceInfo={balanceInfo}
              accountIsController={accountIsController}
              stopLossTriggerData={stopLossTriggerData}
            />
          )
        }
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
