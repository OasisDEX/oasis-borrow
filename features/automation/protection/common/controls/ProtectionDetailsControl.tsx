import { useAutomationContext } from 'components/AutomationContextProvider'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { AutoSellDetailsControl } from 'features/automation/protection/autoSell/controls/AutoSellDetailsControl'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { StopLossDetailsControl } from 'features/automation/protection/stopLoss/controls/StopLossDetailsControl'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

export function ProtectionDetailsControl() {
  const { stopLossTriggerData, autoSellTriggerData } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const { isStopLossActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'details',
  })

  return (
    <>
      <StopLossDetailsControl isStopLossActive={isStopLossActive} />
      <AutoSellDetailsControl />
    </>
  )
}
