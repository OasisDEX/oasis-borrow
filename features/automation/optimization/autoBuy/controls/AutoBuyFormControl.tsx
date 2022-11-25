import { TriggerType } from '@oasisdex/automation'
import { AutomationEventIds, Pages } from 'analytics/analytics'
import { TxHelpers } from 'components/AppContext'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { resolveMaxBuyPriceAnalytics } from 'features/automation/common/helpers'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { getAutoBSStatus } from 'features/automation/common/state/autoBSStatus'
import { getAutoBSTxHandlers } from 'features/automation/common/state/autoBSTxHandlers'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/autoBuy/sidebars/SidebarSetupAutoBuy'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface AutoBuyFormControlProps {
  isAutoBuyActive: boolean
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
}

export function AutoBuyFormControl({
  isAutoBuyActive,
  shouldRemoveAllowance,
  txHelpers,
}: AutoBuyFormControlProps) {
  const [autoBuyState] = useUIChanges<AutoBSFormChange>(AUTO_BUY_FORM_CHANGE)
  const {
    autoBuyTriggerData,
    environmentData: { canInteract },
    positionData: { id, debt, lockedCollateral, positionRatio, owner },
  } = useAutomationContext()

  const feature = AutomationFeatures.AUTO_BUY
  const publishType = AUTO_BUY_FORM_CHANGE
  const {
    isAddForm,
    isFirstSetup,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    currentForm: autoBuyState.currentForm,
    feature: AutomationFeatures.AUTO_BUY,
    triggersId: [autoBuyTriggerData.triggerId],
    txStatus: autoBuyState.txDetails?.txStatus,
  })
  const {
    collateralDelta,
    debtDelta,
    isDisabled,
    isEditing,
    resetData,
    executionPrice,
  } = getAutoBSStatus({
    autoBSState: autoBuyState,
    autoBSTriggerData: autoBuyTriggerData,
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
    autoBSState: autoBuyState,
    isAddForm,
    publishType,
    triggerType: TriggerType.BasicBuy,
    id,
    owner,
    positionRatio,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      isActiveFlag={isAutoBuyActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      publishType={publishType}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[autoBuyTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
      analytics={{
        id: {
          add: AutomationEventIds.AddAutoBuy,
          edit: AutomationEventIds.EditAutoBuy,
          remove: AutomationEventIds.RemoveAutoBuy,
        },
        page: Pages.AutoBuy,
        additionalParams: {
          triggerBuyValue: autoBuyState.execCollRatio.toString(),
          targetValue: autoBuyState.targetCollRatio.toString(),
          maxBuyPrice: resolveMaxBuyPriceAnalytics({
            withMaxBuyPriceThreshold: autoBuyState.withThreshold,
            maxBuyPrice: autoBuyState.maxBuyOrMinSellPrice,
          }),
          maxGasFee: autoBuyState.maxBaseFeeInGwei.toString(),
        },
      }}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupAutoBuy
          autoBuyState={autoBuyState}
          collateralDelta={collateralDelta}
          debtDelta={debtDelta}
          feature={feature}
          isAddForm={isAddForm}
          isAutoBuyActive={isAutoBuyActive}
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
