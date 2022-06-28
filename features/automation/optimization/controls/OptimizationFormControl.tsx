import { TriggerType } from '@oasisdex/automation'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { SidebarSetupAutoBuy } from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import React from 'react'

interface OptimizationFormControlProps {
  automationTriggersData: TriggersData
  vault: Vault
}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
}: OptimizationFormControlProps) {
  const basicBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)

  return <SidebarSetupAutoBuy isAutoBuyOn={basicBuyTriggerData.isTriggerEnabled} vault={vault} />
}
