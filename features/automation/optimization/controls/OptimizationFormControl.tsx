import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
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
  txHelpers?: TxHelpers
  context: Context
}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
  ilkData,
  priceInfo,
  txHelpers,
  context,
}: OptimizationFormControlProps) {
  const basicBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)

  const props: SidebarSetupAutoBuyProps = {
    isAutoBuyOn: basicBuyTriggerData.isTriggerEnabled,
    vault,
    priceInfo,
    autoBuyTriggerData: basicBuyTriggerData,
    ilkData: ilkData,
    txHelpers,
    context,
  }

  return <SidebarSetupAutoBuy {...props} />
}
