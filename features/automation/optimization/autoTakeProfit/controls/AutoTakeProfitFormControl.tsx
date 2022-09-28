import { Vault } from 'blockchain/vaults'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures } from 'features/automation/common/types'
import { SidebarSetupAutoTakeProfit } from 'features/automation/optimization/autoTakeProfit/sidebars/SidebarSetupAutoTakeProfit'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import React from 'react'

interface AutoTakeProfitFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoTakeProfitActive: boolean
  vault: Vault
}

export function AutoTakeProfitFormControl({
  autoBuyTriggerData,
  constantMultipleTriggerData,
  isAutoTakeProfitActive,
  vault,
}: AutoTakeProfitFormControlProps) {
  const feature = AutomationFeatures.AUTO_TAKE_PROFIT

  return (
    // TODO: TDAutoTakeProfit | should be used with AddAndRemoveTriggerControl as a wrapper when there is enough data
    <SidebarSetupAutoTakeProfit
      autoBuyTriggerData={autoBuyTriggerData}
      constantMultipleTriggerData={constantMultipleTriggerData}
      feature={feature}
      isAutoTakeProfitActive={isAutoTakeProfitActive}
      vault={vault}
    />
  )
}
