import { TriggerType } from '@oasisdex/automation'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { BasicBuyDetailsControl } from 'features/automation/optimization/controls/BasicBuyDetailsControl'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { PriceInfo } from 'features/shared/priceInfo'
import React from 'react'

interface OptimizationDetailsControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  priceInfo: PriceInfo
}

export function OptimizationDetailsControl({
  automationTriggersData,
  vault,
  priceInfo,
}: OptimizationDetailsControlProps) {
  const basicBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)

  return (
    <BasicBuyDetailsControl
      vault={vault}
      basicBuyTriggerData={basicBuyTriggerData}
      priceInfo={priceInfo}
    />
  )
}
