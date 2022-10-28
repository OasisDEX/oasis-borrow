import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { AutoBuyFormControl } from 'features/automation/optimization/autoBuy/controls/AutoBuyFormControl'
import { AutoTakeProfitFormControl } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitFormControl'
import { getActiveOptimizationFeature } from 'features/automation/optimization/common/helpers'
import { ConstantMultipleFormControl } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleFormControl'
import { VaultType } from 'features/generalManageVault/vaultType'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect } from 'react'

interface OptimizationFormControlProps {
  txHelpers?: TxHelpers
  vaultType: VaultType
}

export function OptimizationFormControl({ txHelpers, vaultType }: OptimizationFormControlProps) {
  const {
    autoBuyTriggerData,
    automationTriggersData,
    constantMultipleTriggerData,
    autoTakeProfitTriggerData,
  } = useAutomationContext()

  const { uiChanges } = useAppContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const {
    isConstantMultipleActive,
    isAutoBuyActive,
    isAutoTakeProfitActive,
  } = getActiveOptimizationFeature({
    currentOptimizationFeature: activeAutomationFeature?.currentOptimizationFeature,
    isAutoBuyOn: autoBuyTriggerData.isTriggerEnabled,
    isConstantMultipleOn: constantMultipleTriggerData.isTriggerEnabled,
    isAutoTakeProfitOn: autoTakeProfitTriggerData.isTriggerEnabled,
    section: 'form',
  })

  const shouldRemoveAllowance = getShouldRemoveAllowance(automationTriggersData)

  useEffect(() => {
    if (autoTakeProfitTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_TAKE_PROFIT,
      })
    }
    if (constantMultipleTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.CONSTANT_MULTIPLE,
      })
    }
    if (autoBuyTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_BUY,
      })
    }
  }, [])

  return (
    <>
      <AutoBuyFormControl
        isAutoBuyActive={isAutoBuyActive}
        shouldRemoveAllowance={shouldRemoveAllowance}
        txHelpers={txHelpers}
        vaultType={vaultType}
      />
      <ConstantMultipleFormControl
        isConstantMultipleActive={isConstantMultipleActive}
        shouldRemoveAllowance={shouldRemoveAllowance}
        txHelpers={txHelpers}
        vaultType={vaultType}
      />
      <AutoTakeProfitFormControl
        isAutoTakeProfitActive={isAutoTakeProfitActive}
        shouldRemoveAllowance={shouldRemoveAllowance}
        txHelpers={txHelpers}
        vaultType={vaultType}
      />
    </>
  )
}
