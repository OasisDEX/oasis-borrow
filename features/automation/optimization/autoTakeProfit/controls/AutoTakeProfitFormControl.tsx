import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupAutoTakeProfit } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarSetupAutoTakeProfit'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { getAutoTakeProfitStatus } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitStatus'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface AutoTakeProfitFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoTakeProfitActive: boolean
  tokenMarketPrice: BigNumber
  vault: Vault
}

export function AutoTakeProfitFormControl({
  autoBuyTriggerData,
  constantMultipleTriggerData,
  isAutoTakeProfitActive,
  tokenMarketPrice,
  vault,
}: AutoTakeProfitFormControlProps) {
  const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(AUTO_TAKE_PROFIT_FORM_CHANGE)

  const feature = AutomationFeatures.AUTO_TAKE_PROFIT
  const { closePickerConfig, min, max } = getAutoTakeProfitStatus({
    autoTakeProfitState,
    tokenMarketPrice,
    vault,
  })

  return (
    // TODO: TDAutoTakeProfit | should be used with AddAndRemoveTriggerControl as a wrapper when there is enough data
    <SidebarSetupAutoTakeProfit
      autoBuyTriggerData={autoBuyTriggerData}
      autoTakeProfitState={autoTakeProfitState}
      closePickerConfig={closePickerConfig}
      constantMultipleTriggerData={constantMultipleTriggerData}
      feature={feature}
      isAutoTakeProfitActive={isAutoTakeProfitActive}
      max={max}
      min={min}
      vault={vault}
    />
  )
}
