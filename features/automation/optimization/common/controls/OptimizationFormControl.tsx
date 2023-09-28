import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { getAvailableAutomation } from 'features/automation/common/helpers/getAvailableAutomation'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers/getShouldRemoveAllowance'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import type { AutomationChangeFeature } from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'
import { AutoBuyFormControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyFormControl'
import { AutoTakeProfitFormControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitFormControl'
import { getActiveOptimizationFeature } from 'features/automation/optimization/common/helpers'
import { ConstantMultipleFormControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleFormControl'
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
    triggerData: { autoBuyTriggerData, constantMultipleTriggerData, autoTakeProfitTriggerData },
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const { isConstantMultipleActive, isAutoBuyActive, isAutoTakeProfitActive } =
    getActiveOptimizationFeature({
      currentOptimizationFeature: activeAutomationFeature?.currentOptimizationFeature,
      isAutoBuyOn: autoBuyTriggerData.isTriggerEnabled,
      isConstantMultipleOn: constantMultipleTriggerData.isTriggerEnabled,
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
    if (isConstantMultipleActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.CONSTANT_MULTIPLE,
      })
    }
    if (isAutoBuyActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_BUY,
      })
    }
  }, [
    autoTakeProfitTriggerData.isTriggerEnabled,
    constantMultipleTriggerData.isTriggerEnabled,
    autoBuyTriggerData.isTriggerEnabled,
  ])

  const { isAutoBuyAvailable, isConstantMultipleAvailable, isTakeProfitAvailable } =
    getAvailableAutomation(protocol)

  return (
    <>
      {isAutoBuyAvailable && (
        <AutoBuyFormControl
          isAutoBuyActive={isAutoBuyActive}
          shouldRemoveAllowance={shouldRemoveAllowance}
          txHelpers={txHelpers}
        />
      )}
      {isConstantMultipleAvailable && (
        <ConstantMultipleFormControl
          isConstantMultipleActive={isConstantMultipleActive}
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
