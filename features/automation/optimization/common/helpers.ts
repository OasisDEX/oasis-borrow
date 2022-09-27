import { AutomationOptimizationFeatures } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'

export function getActiveOptimizationFeature({
  currentOptimizationFeature,
  isAutoBuyOn,
  isConstantMultipleOn,
  section,
}: {
  currentOptimizationFeature?: AutomationOptimizationFeatures
  isAutoBuyOn?: boolean
  isConstantMultipleOn?: boolean
  isAutoTakeProfitOn?: boolean
  section: 'form' | 'details'
}) {
  return section === 'details'
    ? {
        isAutoBuyActive: isAutoBuyOn || currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
        isConstantMultipleActive:
          isConstantMultipleOn ||
          currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE,
      }
    : {
        isAutoBuyActive: currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
        isConstantMultipleActive:
          currentOptimizationFeature === AutomationFeatures.CONSTANT_MULTIPLE,
        isAutoTakeProfitOn: currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT,
      }
}
