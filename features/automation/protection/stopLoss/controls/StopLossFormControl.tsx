import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { MAX_DEBT_FOR_SETTING_STOP_LOSS } from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { SidebarSetupStopLoss } from 'features/automation/protection/stopLoss/sidebars/SidebarSetupStopLoss'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { getStopLossStatus } from 'features/automation/protection/stopLoss/state/stopLossStatus'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { getStopLossTxHandlers } from 'features/automation/protection/stopLoss/state/stopLossTxHandlers'
import { VaultType } from 'features/generalManageVault/vaultType'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface StopLossFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  balanceInfo: BalanceInfo
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  ethMarketPrice: BigNumber
  ilkData: IlkData
  isStopLossActive: boolean
  priceInfo: PriceInfo
  shouldRemoveAllowance: boolean
  stopLossTriggerData: StopLossTriggerData
  txHelpers?: TxHelpers
  vault: Vault
  vaultType: VaultType
}

export function StopLossFormControl({
  autoBuyTriggerData,
  autoSellTriggerData,
  balanceInfo,
  constantMultipleTriggerData,
  context,
  ethMarketPrice,
  ilkData,
  isStopLossActive,
  priceInfo: { nextCollateralPrice },
  shouldRemoveAllowance,
  stopLossTriggerData,
  txHelpers,
  vault,
  vaultType,
}: StopLossFormControlProps) {
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)

  const feature = AutomationFeatures.STOP_LOSS
  const {
    isAddForm,
    isFirstSetup,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    context,
    currentForm: stopLossState.currentForm,
    feature: AutomationFeatures.STOP_LOSS,
    triggersId: [stopLossTriggerData.triggerId],
    txStatus: stopLossState.txDetails?.txStatus,
    vaultController: vault.controller,
  })
  const { closePickerConfig, executionPrice, isDisabled, isEditing, resetData } = getStopLossStatus(
    {
      ilkData,
      isAddForm,
      isOwner,
      isProgressStage,
      isRemoveForm,
      maxDebtForSettingStopLoss: vault.debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS),
      stage,
      stopLossState,
      stopLossTriggerData,
      vault,
    },
  )
  const { addTxData, textButtonHandlerExtension } = getStopLossTxHandlers({
    isAddForm,
    stopLossState,
    stopLossTriggerData,
    vault,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      ethMarketPrice={ethMarketPrice}
      isActiveFlag={isStopLossActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      proxyAddress={vault.owner}
      publishType={STOP_LOSS_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[stopLossTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupStopLoss
          autoBuyTriggerData={autoBuyTriggerData}
          autoSellTriggerData={autoSellTriggerData}
          balanceInfo={balanceInfo}
          closePickerConfig={closePickerConfig}
          constantMultipleTriggerData={constantMultipleTriggerData}
          context={context}
          ethMarketPrice={ethMarketPrice}
          executionPrice={executionPrice}
          feature={feature}
          ilkData={ilkData}
          isAddForm={isAddForm}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          isStopLossActive={isStopLossActive}
          nextCollateralPrice={nextCollateralPrice}
          stage={stage}
          stopLossState={stopLossState}
          stopLossTriggerData={stopLossTriggerData}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
          vault={vault}
          vaultType={vaultType}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
