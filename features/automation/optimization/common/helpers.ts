import type { AutomationOptimizationFeatures } from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'

export function getActiveOptimizationFeature({
  currentOptimizationFeature,
  isAutoBuyOn,
  isAutoTakeProfitOn,
  section,
}: {
  isAutoBuyOn: boolean
  section: 'form' | 'details'
  currentOptimizationFeature?: AutomationOptimizationFeatures
  isAutoTakeProfitOn?: boolean
}) {
  if (section === 'form') {
    return {
      isAutoBuyActive:
        (isAutoBuyOn && currentOptimizationFeature !== AutomationFeatures.AUTO_TAKE_PROFIT) ||
        currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
      isAutoTakeProfitActive:
        (isAutoTakeProfitOn &&
          !isAutoBuyOn &&
          currentOptimizationFeature !== AutomationFeatures.AUTO_BUY) ||
        currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT,
    }
  }
  return section === 'details'
    ? {
        isAutoBuyActive: isAutoBuyOn || currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
        isAutoTakeProfitActive:
          isAutoTakeProfitOn || currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT,
      }
    : {
        isAutoBuyActive: currentOptimizationFeature === AutomationFeatures.AUTO_BUY,
        isAutoTakeProfitActive: currentOptimizationFeature === AutomationFeatures.AUTO_TAKE_PROFIT,
      }
}
