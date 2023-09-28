import { MixpanelAutomationEventIds, MixpanelPages } from 'analytics/types'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { CloseVaultToEnum } from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupAutoTakeProfit } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarSetupAutoTakeProfit'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.constants'
import type { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.types'
import { getAutoTakeProfitStatus } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitStatus'
import { getAutoTakeProfitTxHandlers } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTxHandlers'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface AutoTakeProfitFormControlProps {
  isAutoTakeProfitActive: boolean
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
}

export function AutoTakeProfitFormControl({
  isAutoTakeProfitActive,
  shouldRemoveAllowance,
  txHelpers,
}: AutoTakeProfitFormControlProps) {
  const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(AUTO_TAKE_PROFIT_FORM_CHANGE)
  const {
    environmentData: { canInteract, tokenMarketPrice },
    positionData: { ilk, id, token, owner },
    triggerData: { autoTakeProfitTriggerData },
  } = useAutomationContext()

  const { isAddForm, isFirstSetup, isProgressStage, isRemoveForm, stage } =
    getAutomationFeatureStatus({
      currentForm: autoTakeProfitState.currentForm,
      feature: AutomationFeatures.AUTO_TAKE_PROFIT,
      triggersId: [autoTakeProfitTriggerData.triggerId],
      txStatus: autoTakeProfitState.txDetails?.txStatus,
    })
  const feature = AutomationFeatures.AUTO_TAKE_PROFIT
  const { closePickerConfig, isEditing, isDisabled, min, max, resetData } = getAutoTakeProfitStatus(
    {
      autoTakeProfitState,
      autoTakeProfitTriggerData,
      isOwner: canInteract,
      isProgressStage,
      isRemoveForm,
      stage,
      tokenMarketPrice,
      id,
      token,
      ilk,
    },
  )
  const { addTxData, textButtonHandlerExtension } = getAutoTakeProfitTxHandlers({
    id,
    owner,
    autoTakeProfitState,
    autoTakeProfitTriggerData,
    isAddForm,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      isActiveFlag={isAutoTakeProfitActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      publishType={AUTO_TAKE_PROFIT_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[autoTakeProfitTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
      analytics={{
        id: {
          add: MixpanelAutomationEventIds.AddTakeProfit,
          edit: MixpanelAutomationEventIds.EditTakeProfit,
          remove: MixpanelAutomationEventIds.RemoveTakeProfit,
        },
        page: MixpanelPages.TakeProfit,
        additionalParams: {
          triggerValue: autoTakeProfitState.executionPrice.toString(),
          closeTo: autoTakeProfitState.toCollateral
            ? CloseVaultToEnum.COLLATERAL
            : CloseVaultToEnum.DAI,
        },
      }}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupAutoTakeProfit
          autoTakeProfitState={autoTakeProfitState}
          closePickerConfig={closePickerConfig}
          feature={feature}
          isAddForm={isAddForm}
          isAutoTakeProfitActive={isAutoTakeProfitActive}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          max={max}
          min={min}
          stage={stage}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
