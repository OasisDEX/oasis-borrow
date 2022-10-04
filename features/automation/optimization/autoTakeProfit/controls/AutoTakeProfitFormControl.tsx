import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { AddAndRemoveTriggerControl } from 'features/automation/common/controls/AddAndRemoveTriggerControl'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
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
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface AutoTakeProfitFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoTakeProfitActive: boolean
  tokenMarketPrice: BigNumber
  vault: Vault
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  ethMarketPrice: BigNumber
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers

}

export function AutoTakeProfitFormControl({
  autoBuyTriggerData,
  constantMultipleTriggerData,
  isAutoTakeProfitActive,
  tokenMarketPrice,
  vault,
  autoTakeProfitTriggerData,
  ethMarketPrice,
  shouldRemoveAllowance,
  txHelpers,
}: AutoTakeProfitFormControlProps) {
  const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(AUTO_TAKE_PROFIT_FORM_CHANGE)
  const isAddForm = true
  const feature = AutomationFeatures.AUTO_TAKE_PROFIT
  const { closePickerConfig, min, max, resetData } = getAutoTakeProfitStatus({
    autoTakeProfitState,
    tokenMarketPrice,
    vault,
  })
  const { addTxData, textButtonHandlerExtension } = getAutoTakeProfitTxHandlers({
    vaultData: vault,
    autoTakeProfitTriggerData,
    autoTakeProfitState,
    isAddForm,
  })

  return (
    // TODO: TDAutoTakeProfit | should be used with AddAndRemoveTriggerControl as a wrapper when there is enough data
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      textButtonHandlerExtension={textButtonHandlerExtension}
      ethMarketPrice={ethMarketPrice}
      isActiveFlag={false}
      isAddForm={true}
      isEditing={true}
      isRemoveForm={false}
      proxyAddress={vault.owner}
      publishType={AUTO_TAKE_PROFIT_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage='editing'//{stage} TODO
      triggersId={[0]}
      txHelpers={txHelpers}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupAutoTakeProfit
          autoBuyTriggerData={autoBuyTriggerData}
          constantMultipleTriggerData={constantMultipleTriggerData}
          feature={feature}
          isAutoTakeProfitActive={isAutoTakeProfitActive}
          vault={vault}
          closePickerConfig={closePickerConfig}
          autoTakeProfitState={autoTakeProfitState}
          min={min}
          max={max}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
