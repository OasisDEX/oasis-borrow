import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
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
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import React from 'react'

interface OptimizationFormControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  ilkData: IlkData
  priceInfo: PriceInfo
  txHelpers?: TxHelpers
  context: Context
  balanceInfo: BalanceInfo
  ethMarketPrice: BigNumber
}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
  ilkData,
  priceInfo,
  txHelpers,
  context,
  balanceInfo,
  ethMarketPrice,
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
    balanceInfo,
    ethMarketPrice,
  }

  return <SidebarSetupAutoBuy {...props} />
}
