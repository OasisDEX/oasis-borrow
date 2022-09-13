import { AutomationProtectionFeatures } from 'features/automation/common/state/automationFeatureChange'
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
        (isAutoSellOn && !isStopLossOn && currentProtectionFeature !== 'stopLoss') ||
        currentProtectionFeature === 'autoSell',
      isStopLossActive:
        (isStopLossOn && currentProtectionFeature !== 'autoSell') ||
        currentProtectionFeature === 'stopLoss',
    }
  }

  if (section === 'details') {
    return {
      isAutoSellActive: isAutoSellOn || currentProtectionFeature === 'autoSell',
      isStopLossActive: isStopLossOn || currentProtectionFeature === 'stopLoss' || !autoBSEnabled,
    }
  }

  return {
    isAutoSellActive: false,
    isStopLossActive: false,
  }
}
