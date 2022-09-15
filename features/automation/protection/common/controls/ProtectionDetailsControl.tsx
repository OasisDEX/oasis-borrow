import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAutomationContext } from 'components/AutomationContextProvider'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { AutoSellDetailsControl } from 'features/automation/protection/autoSell/controls/AutoSellDetailsControl'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { StopLossDetailsControl } from 'features/automation/protection/stopLoss/controls/StopLossDetailsControl'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

interface ProtectionDetailsControlProps {
  ilkData: IlkData
  vault: Vault
}

export function ProtectionDetailsControl({ vault, ilkData }: ProtectionDetailsControlProps) {
  const {
    stopLossTriggerData,
    autoSellTriggerData,
    constantMultipleTriggerData,
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const autoBSEnabled = useFeatureToggle('BasicBS')

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
      {autoBSEnabled && (
        <AutoSellDetailsControl
          vault={vault}
          autoSellTriggerData={autoSellTriggerData}
          isAutoSellActive={isAutoSellActive}
          isconstantMultipleEnabled={constantMultipleTriggerData.isTriggerEnabled}
        />
      )}
    </>
  )
}
