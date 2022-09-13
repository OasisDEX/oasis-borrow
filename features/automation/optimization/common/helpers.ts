import { AutomationOptimizationFeatures } from 'features/automation/common/state/automationFeatureChange'
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
          currentOptimizationFeature !== 'constantMultiple') ||
        currentOptimizationFeature === 'autoBuy',
      isConstantMultipleActive:
        (isConstantMultipleOn && currentOptimizationFeature !== 'autoBuy') ||
        currentOptimizationFeature === 'constantMultiple',
    }
  }

  if (section === 'details') {
    return {
      isAutoBuyActive: isAutoBuyOn || currentOptimizationFeature === 'autoBuy',
      isConstantMultipleActive:
        isConstantMultipleOn ||
        currentOptimizationFeature === 'constantMultiple' ||
        !constantMultipleEnabled,
    }
  }

  return {
    isAutoBuyActive: false,
    isConstantMultipleActive: false,
  }
}
