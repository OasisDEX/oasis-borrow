import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { extractAutoBSData } from 'features/automation/common/state/autoBSTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { BasicSellDetailsControl } from 'features/automation/protection/autoSell/controls/BasicSellDetailsControl'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { StopLossDetailsControl } from 'features/automation/protection/stopLoss/controls/StopLossDetailsControl'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

interface ProtectionDetailsControlProps {
  ilkData: IlkData
  automationTriggersData: TriggersData
  priceInfo: PriceInfo
  vault: Vault
}

export function ProtectionDetailsControl({
  vault,
  automationTriggersData,
  priceInfo,
  ilkData,
}: ProtectionDetailsControlProps) {
  const stopLossTriggerData = extractStopLossData(automationTriggersData)
  const basicSellTriggerData = extractAutoBSData({
    triggersData: automationTriggersData,
    triggerType: TriggerType.BasicSell,
  })
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const autoBSEnabled = useFeatureToggle('AutoBS')

  const { isStopLossActive, isAutoSellActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: basicSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'details',
  })

  return (
    <>
      <StopLossDetailsControl
        vault={vault}
        stopLossTriggerData={stopLossTriggerData}
        priceInfo={priceInfo}
        ilkData={ilkData}
        isStopLossActive={isStopLossActive}
      />
      {autoBSEnabled && (
        <BasicSellDetailsControl
          vault={vault}
          basicSellTriggerData={basicSellTriggerData}
          isAutoSellActive={isAutoSellActive}
        />
      )}
    </>
  )
}
