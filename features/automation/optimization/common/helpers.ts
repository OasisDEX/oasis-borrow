import { AutomationOptimizationFeatures } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

export function getActiveOptimizationFeature({
  isAutoBuyOn,
  isConstantMultipleOn,
  section,
  currentOptimizationFeature,
}: {
  isAutoBuyOn: boolean
  isConstantMultipleOn: boolean
  section: 'form' | 'details'
  currentOptimizationFeature?: AutomationOptimizationFeatures
}) {
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')

  if (section === 'form') {
    return {
      isAutoBuyActive:
        (isAutoBuyOn &&
          !isConstantMultipleOn &&
          currentOptimizationFeature !== AutomationFeatures.CONSTANT_MULTIPLE) ||
        currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
      isConstantMultipleActive:
        (isConstantMultipleOn && currentOptimizationFeature !== AutomationFeatures.AUTO_BUY) ||
        currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE,
    }
  }

  if (section === 'details') {
    return {
      isAutoBuyActive: isAutoBuyOn || currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
      isConstantMultipleActive:
        isConstantMultipleOn ||
        currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE ||
        !constantMultipleEnabled,
    }
  }

  return {
    isAutoBuyActive: false,
    isConstantMultipleActive: false,
  }
}
