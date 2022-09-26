import { AutomationOptimizationFeatures } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

export function getActiveOptimizationFeature({
  isAutoBuyOn,
  isConstantMultipleOn,
  isAutoTakeProfitOn,
  section,
  currentOptimizationFeature,
}: {
  isAutoBuyOn: boolean
  isConstantMultipleOn: boolean
  isAutoTakeProfitOn: boolean
  section: 'form' | 'details'
  currentOptimizationFeature?: AutomationOptimizationFeatures
}) {
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')
  const isAutoTakeProfitEnabled = useFeatureToggle('AutoTakeProfit')

  if (section === 'form') {
    return {
      isAutoBuyActive:
        (isAutoBuyOn &&
          !isConstantMultipleOn &&
          currentOptimizationFeature !== AutomationFeatures.CONSTANT_MULTIPLE) 
          && currentOptimizationFeature !== AutomationFeatures.AUTO_TAKE_PROFIT ||
        currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
      isConstantMultipleActive:
        (isConstantMultipleOn && currentOptimizationFeature !== AutomationFeatures.AUTO_BUY) 
        && currentOptimizationFeature !== AutomationFeatures.AUTO_TAKE_PROFIT ||
        currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE,
      isAutoTakeProfitActive:
        (isAutoTakeProfitOn &&
          currentOptimizationFeature !== AutomationFeatures.AUTO_BUY &&
          currentOptimizationFeature !== AutomationFeatures.CONSTANT_MULTIPLE) ||
        currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT,
    }
  }

  if (section === 'details') {
    return {
      isAutoBuyActive: isAutoBuyOn || currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
      isConstantMultipleActive:
        isConstantMultipleOn ||
        currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE ||
        !constantMultipleEnabled,
      isAutoTakeProfitActive: isAutoTakeProfitOn || currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT || !isAutoTakeProfitEnabled,
    }
  }

  return {
    isAutoBuyActive: false,
    isConstantMultipleActive: false,
    isAutoTakeProfitActive: false,
  }
}
