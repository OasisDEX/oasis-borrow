import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { getAvailableAutomation } from 'features/automation/common/helpers/getAvailableAutomation'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers/getShouldRemoveAllowance'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import type { AutomationChangeFeature } from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'
import { AutoBuyFormControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyFormControl'
import { AutoTakeProfitFormControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitFormControl'
import { getActiveOptimizationFeature } from 'features/automation/optimization/common/helpers'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { uiChanges } from 'helpers/uiChanges'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect } from 'react'

interface OptimizationFormControlProps {
  txHelpers?: TxHelpers
}

export function OptimizationFormControl({ txHelpers }: OptimizationFormControlProps) {
  const {
    automationTriggersData,
    protocol,
    triggerData: { autoBuyTriggerData, autoTakeProfitTriggerData },
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const { isAutoBuyActive, isAutoTakeProfitActive } = getActiveOptimizationFeature({
    currentOptimizationFeature: activeAutomationFeature?.currentOptimizationFeature,
    isAutoBuyOn: autoBuyTriggerData.isTriggerEnabled,
    isAutoTakeProfitOn: autoTakeProfitTriggerData.isTriggerEnabled,
    section: 'form',
  })

  const shouldRemoveAllowance = getShouldRemoveAllowance(automationTriggersData)

  useEffect(() => {
    if (isAutoTakeProfitActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_TAKE_PROFIT,
      })
    }
    if (isAutoBuyActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_BUY,
      })
    }
  }, [autoTakeProfitTriggerData.isTriggerEnabled, autoBuyTriggerData.isTriggerEnabled])

  const { isAutoBuyAvailable, isTakeProfitAvailable } = getAvailableAutomation(protocol)

  return (
    <>
      {isAutoBuyAvailable && (
        <AutoBuyFormControl
          isAutoBuyActive={isAutoBuyActive}
          shouldRemoveAllowance={shouldRemoveAllowance}
          txHelpers={txHelpers}
        />
      )}
      {isTakeProfitAvailable && (
        <AutoTakeProfitFormControl
          isAutoTakeProfitActive={isAutoTakeProfitActive}
          shouldRemoveAllowance={shouldRemoveAllowance}
          txHelpers={txHelpers}
        />
      )}
    </>
  )
}
