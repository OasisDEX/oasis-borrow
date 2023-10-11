import { MixpanelAutomationEventIds, MixpanelPages } from 'analytics/types'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { CloseVaultToEnum, MAX_DEBT_FOR_SETTING_STOP_LOSS } from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  checkIfIsDisabledStopLoss,
  checkIfIsEditingStopLoss,
} from 'features/automation/protection/stopLoss/helpers'
import { SidebarSetupStopLoss } from 'features/automation/protection/stopLoss/sidebars/SidebarSetupStopLoss'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'
import type { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import { getStopLossTxHandlers } from 'features/automation/protection/stopLoss/state/stopLossTxHandlers'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface StopLossFormControlProps {
  isStopLossActive: boolean
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
}

export function StopLossFormControl({
  isStopLossActive,
  shouldRemoveAllowance,
  txHelpers,
}: StopLossFormControlProps) {
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)
  const {
    environmentData: { canInteract },
    metadata: {
      stopLossMetadata: {
        values: { initialSlRatioWhenTriggerDoesntExist, resetData, removeTxData },
        contracts,
      },
    },
    positionData: { debt },
    triggerData: { stopLossTriggerData },
  } = useAutomationContext()

  const feature = AutomationFeatures.STOP_LOSS
  const { isAddForm, isFirstSetup, isProgressStage, isRemoveForm, stage } =
    getAutomationFeatureStatus({
      currentForm: stopLossState.currentForm,
      feature: AutomationFeatures.STOP_LOSS,
      triggersId: [stopLossTriggerData.triggerId],
      txStatus: stopLossState.txDetails?.txStatus,
    })

  const isEditing = checkIfIsEditingStopLoss({
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    selectedSLValue: stopLossState.stopLossLevel,
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    collateralActive: stopLossState.collateralActive,
    isToCollateral: stopLossTriggerData.isToCollateral,
    isRemoveForm,
    initialSlRatioWhenTriggerDoesntExist,
  })

  const isDisabled = checkIfIsDisabledStopLoss({
    isAddForm,
    isEditing,
    isOwner: canInteract,
    isProgressStage,
    maxDebtForSettingStopLoss: debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS), // TODO const per protocol
    stage,
  })

  const { addTxData, textButtonHandlerExtension } = getStopLossTxHandlers({
    isAddForm,
    stopLossState,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      removeTxData={removeTxData}
      isActiveFlag={isStopLossActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      publishType={STOP_LOSS_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[stopLossTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
      analytics={{
        id: {
          add: MixpanelAutomationEventIds.AddStopLoss,
          edit: MixpanelAutomationEventIds.EditStopLoss,
          remove: MixpanelAutomationEventIds.RemoveStopLoss,
        },
        page: MixpanelPages.StopLoss,
        additionalParams: {
          triggerValue: stopLossState.stopLossLevel.toString(),
          closeTo: stopLossState.collateralActive
            ? CloseVaultToEnum.COLLATERAL
            : CloseVaultToEnum.DAI,
        },
      }}
      contracts={contracts}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupStopLoss
          feature={feature}
          isAddForm={isAddForm}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          isStopLossActive={isStopLossActive}
          stage={stage}
          stopLossState={stopLossState}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
