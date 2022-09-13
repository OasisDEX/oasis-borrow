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
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { SidebarSetupAutoSell } from 'features/automation/protection/autoSell/sidebars/SidebarSetupAutoSell'
import { getAutoSellStatus } from 'features/automation/protection/autoSell/state/autoSellStatus'
import { getAutoSellTxHandlers } from 'features/automation/protection/autoSell/state/autoSellTxHandlers'
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
    feature: AutomationFeatures.AUTO_BUY,
    triggersId: [autoSellTriggerData.triggerId],
    txStatus: autoSellState.txDetails?.txStatus,
    vault,
  })
  const {
    collateralDelta,
    debtDelta,
    debtDeltaAtCurrentCollRatio,
    isDisabled,
    isEditing,
    resetData,
  } = getAutoSellStatus({
    autoSellState,
    autoSellTriggerData,
    isAddForm,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
    vault,
  })
  const { addTxData, textButtonHandlerExtension } = getAutoSellTxHandlers({
    autoSellState,
    isAddForm,
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
      publishType={AUTO_SELL_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[autoSellTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers!}
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
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
