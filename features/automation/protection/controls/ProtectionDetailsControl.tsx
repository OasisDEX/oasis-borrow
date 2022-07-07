import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { extractAutoSellData } from 'features/automation/protection/autoSellTriggerDataExtractor'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { extractStopLossData } from 'features/automation/protection/common/StopLossTriggerDataExtractor'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { BasicSellDetailsControl } from 'features/automation/protection/controls/BasicSellDetailsControl'
import { StopLossDetailsControl } from 'features/automation/protection/controls/StopLossDetailsControl'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
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
  const autoSellTriggerData = extractAutoSellData()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const basicBSEnabled = useFeatureToggle('BasicBS')

  const { isStopLossActive, isAutoSellActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isAutoSellEnabled,
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
      {basicBSEnabled && (
        <BasicSellDetailsControl
          token={vault.token}
          autoSellTriggerData={autoSellTriggerData}
          isAutoSellActive={isAutoSellActive}
        />
      )}
    </>
  )
}
