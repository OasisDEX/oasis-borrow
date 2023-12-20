import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { getAvailableAutomation } from 'features/automation/common/helpers/getAvailableAutomation'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers/getShouldRemoveAllowance'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import type { AutomationChangeFeature } from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'
import { AutoSellFormControl } from 'features/automation/protection/autoSell/controls/AutoSellFormControl'
import { getActiveProtectionFeature } from 'features/automation/protection/common/helpers'
import { StopLossFormControl } from 'features/automation/protection/stopLoss/controls/StopLossFormControl'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { uiChanges } from 'helpers/uiChanges'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect } from 'react'

interface ProtectionFormControlProps {
  txHelpers?: TxHelpers
  CustomAutoSellFormControl?: () => JSX.Element | null
}

export function ProtectionFormControl({
  txHelpers,
  CustomAutoSellFormControl,
}: ProtectionFormControlProps) {
  const {
    automationTriggersData,
    protocol,
    triggerData: { autoSellTriggerData, stopLossTriggerData },
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

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

  const AutoSellControl = () => {
    if (CustomAutoSellFormControl) {
      return <CustomAutoSellFormControl />
    }
    return (
      <AutoSellFormControl
        isAutoSellActive={isAutoSellActive}
        shouldRemoveAllowance={shouldRemoveAllowance}
        txHelpers={txHelpers}
      />
    )
  }

  return (
    <>
      {isStopLossAvailable && (
        <StopLossFormControl
          isStopLossActive={isStopLossActive}
          txHelpers={txHelpers}
          shouldRemoveAllowance={shouldRemoveAllowance}
        />
      )}
      {isAutoSellAvailable && <AutoSellControl />}
    </>
  )
}
