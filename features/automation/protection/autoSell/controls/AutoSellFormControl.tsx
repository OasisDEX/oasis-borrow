import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { getAutoBSStatus } from 'features/automation/common/state/autoBSStatus'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { getAutoBSTxHandlers } from 'features/automation/common/state/autoBSTxHandlers'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { SidebarSetupAutoSell } from 'features/automation/protection/autoSell/sidebars/SidebarSetupAutoSell'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface AutoSellFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  balanceInfo: BalanceInfo
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  ethMarketPrice: BigNumber
  ilkData: IlkData
  isAutoSellActive: boolean
  shouldRemoveAllowance: boolean
  stopLossTriggerData: StopLossTriggerData
  txHelpers?: TxHelpers
  vault: Vault
}

export function AutoSellFormControl({
  autoBuyTriggerData,
  autoSellTriggerData,
  balanceInfo,
  constantMultipleTriggerData,
  context,
  ethMarketPrice,
  ilkData,
  isAutoSellActive,
  shouldRemoveAllowance,
  stopLossTriggerData,
  txHelpers,
  vault,
}: AutoSellFormControlProps) {
  const [autoSellState] = useUIChanges<AutoBSFormChange>(AUTO_SELL_FORM_CHANGE)

  const feature = AutomationFeatures.AUTO_SELL
  const publishType = AUTO_SELL_FORM_CHANGE
  const {
    isAddForm,
    isFirstSetup,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    context,
    currentForm: autoSellState.currentForm,
    feature,
    triggersId: [autoSellTriggerData.triggerId],
    txStatus: autoSellState.txDetails?.txStatus,
    vaultController: vault.controller,
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
    isOwner,
    isProgressStage,
    isRemoveForm,
    publishType,
    stage,
    vault,
  })
  const { addTxData, textButtonHandlerExtension } = getAutoBSTxHandlers({
    autoBSState: autoSellState,
    isAddForm,
    publishType,
    triggerType: TriggerType.BasicSell,
    vault,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      ethMarketPrice={ethMarketPrice}
      isActiveFlag={isAutoSellActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      proxyAddress={vault.owner}
      publishType={publishType}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[autoSellTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupAutoSell
          autoBuyTriggerData={autoBuyTriggerData}
          autoSellState={autoSellState}
          autoSellTriggerData={autoSellTriggerData}
          balanceInfo={balanceInfo}
          collateralDelta={collateralDelta}
          constantMultipleTriggerData={constantMultipleTriggerData}
          context={context}
          debtDelta={debtDelta}
          debtDeltaAtCurrentCollRatio={debtDeltaAtCurrentCollRatio}
          ethMarketPrice={ethMarketPrice}
          feature={feature}
          ilkData={ilkData}
          isAddForm={isAddForm}
          isAutoSellActive={isAutoSellActive}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          stage={stage}
          stopLossTriggerData={stopLossTriggerData}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
          vault={vault}
          executionPrice={executionPrice}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
