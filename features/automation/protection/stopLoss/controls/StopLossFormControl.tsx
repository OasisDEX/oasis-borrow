import { AutomationEventIds, Pages } from 'analytics/analytics'
import { TxHelpers } from 'components/AppContext'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { CloseVaultToEnum, MAX_DEBT_FOR_SETTING_STOP_LOSS } from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  checkIfIsDisabledStopLoss,
  checkIfIsEditingStopLoss,
} from 'features/automation/protection/stopLoss/helpers'
import { SidebarSetupStopLoss } from 'features/automation/protection/stopLoss/sidebars/SidebarSetupStopLoss'
import { getStopLossTxHandlers } from 'features/automation/protection/stopLoss/state/stopLossTxHandlers'
import { STOP_LOSS_PUBLISH_KEY } from 'features/automation/protection/stopLoss/state/useStopLossReducer'
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
  const {
    environmentData: { canInteract },
    metadata: {
      stopLossMetadata: {
        values: { initialSlRatioWhenTriggerDoesntExist, resetData },
      },
    },
    positionData: { id, debt, owner },
    triggerData: { stopLossTriggerData },
    reducers: {
      stopLossReducer: { stopLossState, dispatchStopLoss },
    },
  } = useAutomationContext()

  const feature = AutomationFeatures.STOP_LOSS
  const {
    isAddForm,
    isFirstSetup,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
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
    id,
    owner,
    isAddForm,
    stopLossState,
    stopLossTriggerData,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      isActiveFlag={isStopLossActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      publishType={STOP_LOSS_PUBLISH_KEY}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[stopLossTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
      analytics={{
        id: {
          add: AutomationEventIds.AddStopLoss,
          edit: AutomationEventIds.EditStopLoss,
          remove: AutomationEventIds.RemoveStopLoss,
        },
        page: Pages.StopLoss,
        additionalParams: {
          triggerValue: stopLossState.stopLossLevel.toString(),
          closeTo: stopLossState.collateralActive
            ? CloseVaultToEnum.COLLATERAL
            : CloseVaultToEnum.DAI,
        },
      }}
      dispatch={dispatchStopLoss}
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
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
