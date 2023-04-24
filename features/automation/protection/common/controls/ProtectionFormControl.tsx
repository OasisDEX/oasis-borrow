import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import {
  getAvailableAutomation,
  getShouldRemoveAllowance,
} from 'features/automation/common/helpers'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { AutoSellFormControl } from 'features/automation/protection/autoSell/controls/AutoSellFormControl'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { StopLossFormControl } from 'features/automation/protection/stopLoss/controls/StopLossFormControl'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect } from 'react'

interface ProtectionFormControlProps {
  txHelpers?: TxHelpers
}

export function ProtectionFormControl({ txHelpers }: ProtectionFormControlProps) {
  const {
    automationTriggersData,
    protocol,
    triggerData: { autoSellTriggerData, stopLossTriggerData },
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { uiChanges } = useAppContext()

  const shouldRemoveAllowance = getShouldRemoveAllowance(automationTriggersData)

  const { isStopLossActive, isAutoSellActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'form',
  })

  useEffect(() => {
    if (isAutoSellActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Protection',
        currentProtectionFeature: AutomationFeatures.AUTO_SELL,
      })
    }
    if (isStopLossActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Protection',
        currentProtectionFeature: AutomationFeatures.STOP_LOSS,
      })
    }
  }, [autoSellTriggerData.isTriggerEnabled, stopLossTriggerData.isStopLossEnabled])

  const { isStopLossAvailable, isAutoSellAvailable } = getAvailableAutomation(protocol)

  return (
    <>
      {isStopLossAvailable && (
        <StopLossFormControl
          isStopLossActive={isStopLossActive}
          txHelpers={txHelpers}
          shouldRemoveAllowance={shouldRemoveAllowance}
        />
      )}
      {isAutoSellAvailable && (
        <AutoSellFormControl
          isAutoSellActive={isAutoSellActive}
          txHelpers={txHelpers}
          shouldRemoveAllowance={shouldRemoveAllowance}
        />
      )}
    </>
  )
}
