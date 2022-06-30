import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import {
  SidebarSetupAutoBuy,
  SidebarSetupAutoBuyProps,
} from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { PriceInfo } from 'features/shared/priceInfo'
import React from 'react'

interface OptimizationFormControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  ilkData: IlkData
  priceInfo: PriceInfo
}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
  ilkData,
  priceInfo,
}: OptimizationFormControlProps) {
  const basicBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)

  const props: SidebarSetupAutoBuyProps = {
    isAutoBuyOn: basicBuyTriggerData.isTriggerEnabled,
    vault,
    // maxGasPercentagePrice: uiState.maxGasPercentagePrice,
    priceInfo,
    autoBuyTriggerData: basicBuyTriggerData,
    ilkData: ilkData,
  }

  return <SidebarSetupAutoBuy {...props} />
}
