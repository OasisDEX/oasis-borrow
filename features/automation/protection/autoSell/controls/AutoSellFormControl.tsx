import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { prepareAutoBSResetData } from 'features/automation/common/helpers'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { getAutomationFeatureTxHandlers } from 'features/automation/common/state/automationFeatureTxHandlers'
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
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoSellActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
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
  const { textButtonHandler, txHandler } = getAutomationFeatureTxHandlers({
    addTxData,
    ethMarketPrice,
    isAddForm,
    isRemoveForm,
    proxyAddress: vault.owner,
    publishType: AUTO_SELL_FORM_CHANGE,
    resetData,
    shouldRemoveAllowance,
    stage,
    textButtonHandlerExtension,
    triggersId: [autoSellTriggerData.triggerId.toNumber()],
    txHelpers,
  })

  return (
    <AddAndRemoveTriggerControl
      txHelpers={txHelpers!}
      ethMarketPrice={ethMarketPrice}
      isEditing={isEditing}
      removeAllowance={shouldRemoveAllowance}
      proxyAddress={vault.owner}
      stage={stage}
      addTxData={addTxData}
      resetData={prepareAutoBSResetData(
        autoSellTriggerData,
        vault.collateralizationRatio,
        AUTO_SELL_FORM_CHANGE,
      )}
      publishType={AUTO_SELL_FORM_CHANGE}
      currentForm={autoSellState.currentForm}
      triggersId={[autoSellTriggerData.triggerId.toNumber()]}
      isActiveFlag={isAutoSellActive}
      textButtonHandlerExtension={textButtonHandlerExtension}
    >
      {() => (
        <SidebarSetupAutoSell
          vault={vault}
          ilkData={ilkData}
          balanceInfo={balanceInfo}
          autoSellTriggerData={autoSellTriggerData}
          autoBuyTriggerData={autoBuyTriggerData}
          stopLossTriggerData={stopLossTriggerData}
          constantMultipleTriggerData={constantMultipleTriggerData}
          isAutoSellActive={isAutoSellActive}
          context={context}
          ethMarketPrice={ethMarketPrice}
          autoSellState={autoSellState}
          textButtonHandler={textButtonHandler}
          stage={stage}
          isAddForm={isAddForm}
          isRemoveForm={isRemoveForm}
          isEditing={isEditing}
          isDisabled={isDisabled}
          isFirstSetup={isFirstSetup}
          debtDelta={debtDelta}
          debtDeltaAtCurrentCollRatio={debtDeltaAtCurrentCollRatio}
          collateralDelta={collateralDelta}
          txHandler={txHandler}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
