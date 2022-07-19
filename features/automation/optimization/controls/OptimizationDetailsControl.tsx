import { TriggerType } from '@oasisdex/automation'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { extractConstantMultiplyData } from 'features/automation/common/constantMultiplyTriggerData'
import { BasicBuyDetailsControl } from 'features/automation/optimization/controls/BasicBuyDetailsControl'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

import { ConstantMultipleDetailsControl } from './ConstantMultipleDetailsControl'

interface OptimizationDetailsControlProps {
  automationTriggersData: TriggersData
  vault: Vault
}

export function OptimizationDetailsControl({
  automationTriggersData,
  vault,
}: OptimizationDetailsControlProps) {
  const basicBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)
  const constantMultiplyTriggerData = extractConstantMultiplyData()
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')

  return (
    <>
      <BasicBuyDetailsControl vault={vault} basicBuyTriggerData={basicBuyTriggerData} />
      {constantMultipleEnabled && (
        <ConstantMultipleDetailsControl
          vault={vault}
          constantMultiplyTriggerData={constantMultiplyTriggerData}
        />
      )}
    </>
  )
}
