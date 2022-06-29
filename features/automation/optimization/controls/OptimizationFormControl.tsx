import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import {
  SidebarSetupAutoBuy,
  SidebarSetupAutoBuyProps,
} from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import {
  failedStatuses,
  progressStatuses,
} from 'features/automation/protection/common/consts/txStatues'
import {
  BASIC_BUY_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import React, { useState } from 'react'
import { IlkData } from 'blockchain/ilks'
import { PriceInfo } from 'features/shared/priceInfo'
import { Context } from 'blockchain/network'

interface OptimizationFormControlProps {
  automationTriggersData: TriggersData
  vault: Vault
  ilkData: IlkData
  priceInfo: PriceInfo
  // context: Context

}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
  ilkData,
  priceInfo,
}: OptimizationFormControlProps) {
  const basicBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)

  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)

  // const { isTriggerEnabled } = basicBuyTriggerData
  // const [firstSetup, setFirstSetup] = useState(!isTriggerEnabled)

  const props: SidebarSetupAutoBuyProps = {
    isAutoBuyOn: basicBuyTriggerData.isTriggerEnabled,
    vault,
    currentForm: uiState.currentForm,
    // maxGasPercentagePrice: uiState.maxGasPercentagePrice,
    priceInfo,
    autoBuyTriggerData: basicBuyTriggerData,
    ilkData: ilkData,
  }

  return <SidebarSetupAutoBuy {...props} />
}
