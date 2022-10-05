import { AutomationOptimizationFeatures } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
// import { useFeatureToggle } from 'helpers/useFeatureToggle'

export function getActiveOptimizationFeature({
  currentOptimizationFeature,
  isAutoBuyOn,
  isConstantMultipleOn,
  isAutoTakeProfitOn,
  section,
}: {
  isAutoBuyOn: boolean
  isConstantMultipleOn: boolean
  section: 'form' | 'details'
  currentOptimizationFeature?: AutomationOptimizationFeatures
  isAutoTakeProfitOn?: boolean
}) {
  // const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')

  if (section === 'form') {
    return {
      isAutoBuyActive:
        (isAutoBuyOn &&
          !isConstantMultipleOn &&
          currentOptimizationFeature !== AutomationFeatures.CONSTANT_MULTIPLE &&
          currentOptimizationFeature !== AutomationFeatures.AUTO_TAKE_PROFIT) ||
        currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
      isConstantMultipleActive:
        (isConstantMultipleOn &&
          currentOptimizationFeature !== AutomationFeatures.AUTO_BUY &&
          currentOptimizationFeature !== AutomationFeatures.AUTO_TAKE_PROFIT) ||
        currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE,
      isAutoTakeProfitActive:
        (isAutoTakeProfitOn &&
          currentOptimizationFeature !== AutomationFeatures.AUTO_BUY &&
          currentOptimizationFeature !== AutomationFeatures.CONSTANT_MULTIPLE) ||
        currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT,
    }
  }
  return section === 'details'
    ? {
        isAutoBuyActive: isAutoBuyOn || currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
        isConstantMultipleActive:
          isConstantMultipleOn ||
          currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE,
        isAutoTakeProfitActive:
          isAutoTakeProfitOn || currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT,
      }
    : {
        isAutoBuyActive: currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
        isConstantMultipleActive:
          currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE,
        isAutoTakeProfitActive: currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT,
      }

  // return {
  //   isAutoBuyActive: false,
  //   isConstantMultipleActive: false,
  // }
}
