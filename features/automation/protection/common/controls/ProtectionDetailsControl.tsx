import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { getAvailableAutomation } from 'features/automation/common/helpers/getAvailableAutomation'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import type { AutomationChangeFeature } from 'features/automation/common/state/automationFeatureChange.types'
import { AutoSellDetailsControl } from 'features/automation/protection/autoSell/controls/AutoSellDetailsControl'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { StopLossDetailsControl } from 'features/automation/protection/stopLoss/controls/StopLossDetailsControl'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

export interface ProtectionDetailsControlProps {
  AutoSell?: () => JSX.Element | null
}
export function ProtectionDetailsControl({
  AutoSell = AutoSellDetailsControl,
}: ProtectionDetailsControlProps) {
  const {
    protocol,
    triggerData: { autoSellTriggerData, stopLossTriggerData },
    metadata: {
      stopLossMetadata: { stopLossWriteEnabled },
    },
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const { isStopLossActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'details',
  })

  const { isStopLossAvailable, isAutoSellAvailable } = getAvailableAutomation(protocol)

  return (
    <>
      {stopLossWriteEnabled && isStopLossAvailable && (
        <StopLossDetailsControl isStopLossActive={isStopLossActive} />
      )}
      {isAutoSellAvailable && <AutoSell />}
    </>
  )
}
