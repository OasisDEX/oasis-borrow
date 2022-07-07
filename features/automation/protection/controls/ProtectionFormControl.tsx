import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { SidebarSetupAutoSell } from 'features/automation/protection/controls/sidebar/SidebarSetupAutoSell'
import { StopLossFormControl } from 'features/automation/protection/controls/StopLossFormControl'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface ProtectionFormControlProps {
  ilkData: IlkData
  automationTriggersData: TriggersData
  priceInfo: PriceInfo
  vault: Vault
  balanceInfo: BalanceInfo
  account?: string
}

export function ProtectionFormControl({
  ilkData,
  automationTriggersData,
  priceInfo,
  vault,
  account,
  balanceInfo,
}: ProtectionFormControlProps) {
  const stopLossTriggerData = extractStopLossData(automationTriggersData)
  const autoSellTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicSell)
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const { isStopLossActive, isAutoSellActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'form',
  })

  return (
    <>
      <StopLossFormControl
        ilkData={ilkData}
        stopLossTriggerData={stopLossTriggerData}
        priceInfo={priceInfo}
        vault={vault}
        account={account}
        balanceInfo={balanceInfo}
        isStopLossActive={isStopLossActive}
      />
      <SidebarSetupAutoSell
        vault={vault}
        autoSellTriggerData={autoSellTriggerData}
        isAutoSellActive={isAutoSellActive}
      />
    </>
  )
}
