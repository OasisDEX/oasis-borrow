import { AutomationEventIds, Pages } from 'analytics/analytics'
import { TxHelpers } from 'components/AppContext'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import {
  calculateMultipleFromTargetCollRatio,
  resolveMaxBuyPriceAnalytics,
  resolveMinSellPriceAnalytics,
} from 'features/automation/common/helpers'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupConstantMultiple } from 'features/automation/optimization/constantMultiple/sidebars/SidebarSetupConstantMultiple'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { getConstantMultipleStatus } from 'features/automation/optimization/constantMultiple/state/constantMultipleStatus'
import { getConstantMultipleTxHandlers } from 'features/automation/optimization/constantMultiple/state/constantMultipleTxHandlers'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface ConstantMultipleFormControlProps {
  isConstantMultipleActive: boolean
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
}

export function ConstantMultipleFormControl({
  isConstantMultipleActive,
  shouldRemoveAllowance,
  txHelpers,
}: ConstantMultipleFormControlProps) {
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  const {
    environmentData: { canInteract, ethMarketPrice },
    positionData: { id, owner, debt, positionRatio, lockedCollateral },
    triggerData: { autoBuyTriggerData, autoSellTriggerData, constantMultipleTriggerData },
  } = useAutomationContext()

  const feature = AutomationFeatures.CONSTANT_MULTIPLE
  const {
    isAddForm,
    isFirstSetup,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    currentForm: constantMultipleState.currentForm,
    feature,
    triggersId: constantMultipleTriggerData.triggersId,
    txStatus: constantMultipleState.txDetails?.txStatus,
  })
  const {
    collateralToBePurchased,
    collateralToBeSold,
    debtDeltaAfterSell,
    debtDeltaWhenSellAtCurrentCollRatio,
    estimatedBuyFee,
    estimatedGasCostOnTrigger,
    estimatedSellFee,
    isDisabled,
    isEditing,
    nextBuyPrice,
    nextSellPrice,
    resetData,
  } = getConstantMultipleStatus({
    constantMultipleState,
    constantMultipleTriggerData,
    ethMarketPrice,
    isAddForm,
    isOwner: canInteract,
    isProgressStage,
    isRemoveForm,
    stage,
    debt,
    positionRatio,
    lockedCollateral,
  })
  const { addTxData, textButtonHandlerExtension } = getConstantMultipleTxHandlers({
    autoBuyTriggerData,
    autoSellTriggerData,
    constantMultipleState,
    constantMultipleTriggerData,
    isAddForm,
    id,
    owner,
    positionRatio,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      isActiveFlag={isConstantMultipleActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      publishType={CONSTANT_MULTIPLE_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={constantMultipleTriggerData.triggersId.map((triggerId) => triggerId.toNumber())}
      txHelpers={txHelpers}
      analytics={{
        id: {
          add: AutomationEventIds.AddConstantMultiple,
          edit: AutomationEventIds.EditConstantMultiple,
          remove: AutomationEventIds.RemoveConstantMultiple,
        },
        page: Pages.ConstantMultiple,
        additionalParams: {
          triggerBuyValue: constantMultipleState.buyExecutionCollRatio.toString(),
          triggerSellValue: constantMultipleState.sellExecutionCollRatio.toString(),
          targetValue: constantMultipleState.targetCollRatio.toString(),
          targetMultiple: calculateMultipleFromTargetCollRatio(
            constantMultipleState.targetCollRatio,
          )
            .decimalPlaces(2)
            .toString(),
          minSellPrice: resolveMinSellPriceAnalytics({
            withMinSellPriceThreshold: constantMultipleState.sellWithThreshold,
            minSellPrice: constantMultipleState.minSellPrice,
          }),
          maxBuyPrice: resolveMaxBuyPriceAnalytics({
            withMaxBuyPriceThreshold: constantMultipleState.buyWithThreshold,
            maxBuyPrice: constantMultipleState.maxBuyPrice,
          }),
          maxGasFee: constantMultipleState.maxBaseFeeInGwei.toString(),
        },
      }}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupConstantMultiple
          collateralToBePurchased={collateralToBePurchased}
          collateralToBeSold={collateralToBeSold}
          constantMultipleState={constantMultipleState}
          debtDeltaAfterSell={debtDeltaAfterSell}
          debtDeltaWhenSellAtCurrentCollRatio={debtDeltaWhenSellAtCurrentCollRatio}
          estimatedBuyFee={estimatedBuyFee}
          estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
          estimatedSellFee={estimatedSellFee}
          feature={feature}
          isAddForm={isAddForm}
          isConstantMultipleActive={isConstantMultipleActive}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          nextBuyPrice={nextBuyPrice}
          nextSellPrice={nextSellPrice}
          stage={stage}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
