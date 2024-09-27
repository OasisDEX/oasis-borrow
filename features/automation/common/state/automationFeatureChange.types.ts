import type { AutomationFeatures } from 'features/automation/common/types'

export type AutomationTypes = 'Protection' | 'Optimization'
export type AutomationProtectionFeatures =
  | AutomationFeatures.STOP_LOSS
  | AutomationFeatures.AUTO_SELL
export type AutomationOptimizationFeatures =
  | AutomationFeatures.AUTO_BUY
  | AutomationFeatures.AUTO_TAKE_PROFIT
export type AutomationFormType = 'add' | 'remove'

export type AutomationChangeFeatureAction = {
  type: AutomationTypes
  currentProtectionFeature?: AutomationProtectionFeatures
  currentOptimizationFeature?: AutomationOptimizationFeatures
}

export type AutomationChangeFeature = Omit<AutomationChangeFeatureAction, 'type'>
