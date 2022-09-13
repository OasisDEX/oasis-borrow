import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { prepareAutoBSResetData } from 'features/automation/common/helpers'
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
import { getAutoSellTx } from 'features/automation/protection/autoSell/state/autoSellTx'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
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
  vault,
  ilkData,
  balanceInfo,
  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  constantMultipleTriggerData,
  isAutoSellActive,
  txHelpers,
  context,
  ethMarketPrice,
  shouldRemoveAllowance,
}: AutoSellFormControlProps) {
  const { uiChanges } = useAppContext()
  const [autoSellState] = useUIChanges<AutoBSFormChange>(AUTO_SELL_FORM_CHANGE)

  const { addTxData, txStatus } = getAutoSellTx({
    autoSellState,
    vault,
  })
  const {
    isAddForm,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
    isFirstSetup,
  } = getAutomationFeatureStatus({
    context,
    currentForm: autoSellState.currentForm,
    feature: AutomationFeatures.AUTO_BUY,
    vault,
    txStatus,
    triggersId: [autoSellTriggerData.triggerId],
  })
  const {
    isEditing,
    isDisabled,
    debtDelta,
    debtDeltaAtCurrentCollRatio,
    collateralDelta,
  } = getAutoSellStatus({
    autoSellTriggerData,
    autoSellState,
    isRemoveForm,
    isProgressStage,
    isOwner,
    isAddForm,
    stage,
    vault,
  })

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
        type: 'execution-coll-ratio',
        execCollRatio: zero,
      })
      uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
        type: 'target-coll-ratio',
        targetCollRatio: zero,
      })
    }
  }

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
      {(txHandler, textButtonHandler) => (
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
