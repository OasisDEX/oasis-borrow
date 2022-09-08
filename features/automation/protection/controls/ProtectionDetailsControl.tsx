import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { BasicSellDetailsControl } from 'features/automation/protection/controls/BasicSellDetailsControl'
import { StopLossDetailsControl } from 'features/automation/protection/controls/StopLossDetailsControl'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

interface ProtectionDetailsControlProps {
  ilkData: IlkData
  vault: Vault
}

export function ProtectionDetailsControl({ vault, ilkData }: ProtectionDetailsControlProps) {
  const { stopLossTriggerData, autoSellTriggerData } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const basicBSEnabled = useFeatureToggle('BasicBS')

  const { isStopLossActive, isAutoSellActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'details',
  })

  return (
    <>
      <StopLossDetailsControl
        vault={vault}
        stopLossTriggerData={stopLossTriggerData}
        ilkData={ilkData}
        isStopLossActive={isStopLossActive}
      />
      {basicBSEnabled && (
        <BasicSellDetailsControl
          vault={vault}
          basicSellTriggerData={autoSellTriggerData}
          isAutoSellActive={isAutoSellActive}
        />
      )}
    </>
  )
}
