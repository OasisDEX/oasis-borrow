import { AutomationOptimizationFeatures } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'

export function getActiveOptimizationFeature({
  currentOptimizationFeature,
  isAutoBuyOn,
  isAutoTakeProfitOn,
  isConstantMultipleOn,
  section,
}: {
  currentOptimizationFeature?: AutomationOptimizationFeatures
  isAutoBuyOn?: boolean
  isAutoTakeProfitOn?: boolean
  isConstantMultipleOn?: boolean
  section: 'form' | 'details'
}) {
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
}
