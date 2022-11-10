import { AutomationEventIds, Pages } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { CloseVaultToEnum } from 'features/automation/common/consts'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { getAutomationFeatureStatus } from 'features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupAutoTakeProfit } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarSetupAutoTakeProfit'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { getAutoTakeProfitStatus } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitStatus'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { getAutoTakeProfitTxHandlers } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTxHandlers'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { VaultType } from 'features/generalManageVault/vaultType'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface AutoTakeProfitFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  ethMarketPrice: BigNumber
  ilkData: IlkData
  isAutoTakeProfitActive: boolean
  shouldRemoveAllowance: boolean
  tokenMarketPrice: BigNumber
  priceInfo: PriceInfo
  txHelpers?: TxHelpers
  vault: Vault
  vaultType: VaultType
  balanceInfo: BalanceInfo
}

export function AutoTakeProfitFormControl({
  autoBuyTriggerData,
  autoTakeProfitTriggerData,
  constantMultipleTriggerData,
  context,
  ethMarketPrice,
  ilkData,
  isAutoTakeProfitActive,
  shouldRemoveAllowance,
  tokenMarketPrice,
  priceInfo: { nextCollateralPrice },
  txHelpers,
  vault,
  vaultType,
  balanceInfo,
}: AutoTakeProfitFormControlProps) {
  const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(AUTO_TAKE_PROFIT_FORM_CHANGE)

  const {
    isAddForm,
    isFirstSetup,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    context,
    currentForm: autoTakeProfitState.currentForm,
    feature: AutomationFeatures.AUTO_TAKE_PROFIT,
    triggersId: [autoTakeProfitTriggerData.triggerId],
    txStatus: autoTakeProfitState.txDetails?.txStatus,
    vaultController: vault.controller,
  })
  const feature = AutomationFeatures.AUTO_TAKE_PROFIT
  const { closePickerConfig, isEditing, isDisabled, min, max, resetData } = getAutoTakeProfitStatus(
    {
      autoTakeProfitState,
      autoTakeProfitTriggerData,
      isOwner,
      isProgressStage,
      isRemoveForm,
      stage,
      tokenMarketPrice,
      vault,
    },
  )
  const { addTxData, textButtonHandlerExtension } = getAutoTakeProfitTxHandlers({
    autoTakeProfitState,
    autoTakeProfitTriggerData,
    isAddForm,
    vault,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      ethMarketPrice={ethMarketPrice}
      isActiveFlag={isAutoTakeProfitActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      publishType={AUTO_TAKE_PROFIT_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[autoTakeProfitTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
      vault={vault}
      analytics={{
        id: {
          add: AutomationEventIds.AddTakeProfit,
          edit: AutomationEventIds.EditTakeProfit,
          remove: AutomationEventIds.RemoveTakeProfit,
        },
        page: Pages.TakeProfit,
        additionalParams: {
          triggerValue: autoTakeProfitState.executionPrice.toString(),
          closeTo: autoTakeProfitState.toCollateral
            ? CloseVaultToEnum.COLLATERAL
            : CloseVaultToEnum.DAI,
        },
      }}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupAutoTakeProfit
          autoBuyTriggerData={autoBuyTriggerData}
          autoTakeProfitState={autoTakeProfitState}
          autoTakeProfitTriggerData={autoTakeProfitTriggerData}
          closePickerConfig={closePickerConfig}
          constantMultipleTriggerData={constantMultipleTriggerData}
          context={context}
          ethMarketPrice={ethMarketPrice}
          feature={feature}
          ilkData={ilkData}
          isAddForm={isAddForm}
          isAutoTakeProfitActive={isAutoTakeProfitActive}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          max={max}
          min={min}
          stage={stage}
          textButtonHandler={textButtonHandler}
          tokenMarketPrice={tokenMarketPrice}
          txHandler={txHandler}
          vault={vault}
          nextCollateralPrice={nextCollateralPrice}
          ethBalance={balanceInfo.ethBalance}
          vaultType={vaultType}
          isAwaitingConfirmation={autoTakeProfitState.isAwaitingConfirmation}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
