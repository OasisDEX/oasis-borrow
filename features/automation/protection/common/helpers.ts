import { AutomationProtectionFeatures } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

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
  const autoBSEnabled = useFeatureToggle('BasicBS')

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
      isStopLossActive:
        isStopLossOn || currentProtectionFeature === AutomationFeatures.STOP_LOSS || !autoBSEnabled,
    }
  }

  return {
    isAutoSellActive: false,
    isStopLossActive: false,
  }
}
