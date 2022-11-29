import { TriggerType } from '@oasisdex/automation'
import { AutomationEventIds, Pages } from 'analytics/analytics'
import { TxHelpers } from 'components/AppContext'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { resolveMinSellPriceAnalytics } from 'features/automation/common/helpers'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { getAutoBSStatus } from 'features/automation/common/state/autoBSStatus'
import { getAutoBSTxHandlers } from 'features/automation/common/state/autoBSTxHandlers'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupAutoSell } from 'features/automation/protection/autoSell/sidebars/SidebarSetupAutoSell'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface AutoSellFormControlProps {
  isAutoSellActive: boolean
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
}

export function AutoSellFormControl({
  isAutoSellActive,
  shouldRemoveAllowance,
  txHelpers,
}: AutoSellFormControlProps) {
  const [autoSellState] = useUIChanges<AutoBSFormChange>(AUTO_SELL_FORM_CHANGE)

  const {
    environmentData: { canInteract },
    positionData: { id, debt, lockedCollateral, positionRatio, owner },
    triggerData: { autoSellTriggerData },
  } = useAutomationContext()

  const feature = AutomationFeatures.AUTO_SELL
  const publishType = AUTO_SELL_FORM_CHANGE
  const {
    isAddForm,
    isFirstSetup,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    currentForm: autoSellState.currentForm,
    feature,
    triggersId: [autoSellTriggerData.triggerId],
    txStatus: autoSellState.txDetails?.txStatus,
  })
  const {
    collateralDelta,
    debtDelta,
    debtDeltaAtCurrentCollRatio,
    isDisabled,
    isEditing,
    resetData,
    executionPrice,
  } = getAutoBSStatus({
    autoBSState: autoSellState,
    autoBSTriggerData: autoSellTriggerData,
    isAddForm,
    isOwner: canInteract,
    isProgressStage,
    isRemoveForm,
    publishType,
    stage,
    debt,
    lockedCollateral,
    positionRatio,
  })
  const { addTxData, textButtonHandlerExtension } = getAutoBSTxHandlers({
    id,
    owner,
    positionRatio,
    autoBSState: autoSellState,
    isAddForm,
    publishType,
    triggerType: TriggerType.BasicSell,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      isActiveFlag={isAutoSellActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      publishType={publishType}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[autoSellTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
      analytics={{
        id: {
          add: AutomationEventIds.AddAutoSell,
          edit: AutomationEventIds.EditAutoSell,
          remove: AutomationEventIds.RemoveAutoSell,
        },
        page: Pages.AutoSell,
        additionalParams: {
          triggerSellValue: autoSellState.execCollRatio.toString(),
          targetValue: autoSellState.targetCollRatio.toString(),
          minSellPrice: resolveMinSellPriceAnalytics({
            withMinSellPriceThreshold: autoSellState.withThreshold,
            minSellPrice: autoSellState.maxBuyOrMinSellPrice,
          }),
          maxGasFee: autoSellState.maxBaseFeeInGwei.toString(),
        },
      }}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupAutoSell
          autoSellState={autoSellState}
          collateralDelta={collateralDelta}
          debtDelta={debtDelta}
          debtDeltaAtCurrentCollRatio={debtDeltaAtCurrentCollRatio}
          feature={feature}
          isAddForm={isAddForm}
          isAutoSellActive={isAutoSellActive}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          stage={stage}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
          executionPrice={executionPrice}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
