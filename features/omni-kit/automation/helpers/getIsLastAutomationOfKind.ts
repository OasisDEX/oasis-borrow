import { AutomationFeatures } from 'features/automation/common/types'
import type { AutomationMetadataFlags } from 'features/omni-kit/types'
import { TriggerAction } from 'helpers/lambda/triggers'

interface LastTriggerStatus {
  isLastProtection: boolean
  isLastOptimization: boolean
}

export function getIsLastAutomationOfKind({
  automationFlags,
  automationFeature,
  action,
}: {
  automationFlags: AutomationMetadataFlags
  automationFeature: AutomationFeatures
  action: TriggerAction
}): LastTriggerStatus {
  // Determine which features are considered protection and optimization
  const protectionFeatures = [
    AutomationFeatures.STOP_LOSS,
    AutomationFeatures.AUTO_SELL,
    AutomationFeatures.TRAILING_STOP_LOSS,
  ]

  const optimizationFeatures = [
    AutomationFeatures.AUTO_BUY,
    AutomationFeatures.CONSTANT_MULTIPLE,
    AutomationFeatures.AUTO_TAKE_PROFIT,
    AutomationFeatures.PARTIAL_TAKE_PROFIT,
  ]

  // Map features to their respective flags in the automationFlags
  const featureFlags: { [key in AutomationFeatures]: boolean } = {
    [AutomationFeatures.STOP_LOSS]: automationFlags.isStopLossEnabled,
    [AutomationFeatures.AUTO_SELL]: automationFlags.isAutoSellEnabled,
    [AutomationFeatures.TRAILING_STOP_LOSS]: automationFlags.isTrailingStopLossEnabled,
    [AutomationFeatures.AUTO_BUY]: automationFlags.isAutoBuyEnabled,
    [AutomationFeatures.CONSTANT_MULTIPLE]: false, // Assuming this feature is always disabled as no flag is provided
    [AutomationFeatures.AUTO_TAKE_PROFIT]: false, // Assuming this feature is always disabled as no flag is provided
    [AutomationFeatures.PARTIAL_TAKE_PROFIT]: automationFlags.isPartialTakeProfitEnabled,
  }

  if (action === TriggerAction.Remove || action === TriggerAction.Update) {
    featureFlags[automationFeature] = false
  }

  // Check if the feature being removed is the last protection or optimization
  const isLastProtection = protectionFeatures.every((f) => !featureFlags[f])
  const isLastOptimization = optimizationFeatures.every((f) => !featureFlags[f])

  return { isLastProtection, isLastOptimization }
}
