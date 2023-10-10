import type { AutomationProtectionFeatures } from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'

export function getActiveProtectionFeature({
  isAutoSellOn,
  isStopLossOn,
  section,
  currentProtectionFeature,
}: {
  isAutoSellOn: boolean
  isStopLossOn: boolean
  section: 'form' | 'details'
  currentProtectionFeature?: AutomationProtectionFeatures
}) {
  if (section === 'form') {
    return {
      isAutoSellActive:
        (isAutoSellOn &&
          !isStopLossOn &&
          currentProtectionFeature !== AutomationFeatures.STOP_LOSS) ||
        currentProtectionFeature === AutomationFeatures.AUTO_SELL,
      isStopLossActive:
        (isStopLossOn && currentProtectionFeature !== AutomationFeatures.AUTO_SELL) ||
        currentProtectionFeature === AutomationFeatures.STOP_LOSS,
    }
  }

  if (section === 'details') {
    return {
      isAutoSellActive: isAutoSellOn || currentProtectionFeature === AutomationFeatures.AUTO_SELL,
      isStopLossActive: isStopLossOn || currentProtectionFeature === AutomationFeatures.STOP_LOSS,
    }
  }

  return {
    isAutoSellActive: false,
    isStopLossActive: false,
  }
}
