import { AutomationFeatures } from 'features/automation/common/types'

export type AutomationTypes = 'Protection' | 'Optimization'
export type AutomationProtectionFeatures =
  | AutomationFeatures.STOP_LOSS
  | AutomationFeatures.AUTO_SELL
export type AutomationOptimizationFeatures =
  | AutomationFeatures.AUTO_BUY
  | AutomationFeatures.CONSTANT_MULTIPLE
  | AutomationFeatures.AUTO_TAKE_PROFIT
export type AutomationFormType = 'add' | 'remove'

export const AUTOMATION_CHANGE_FEATURE = 'automationChangeFeature'

export type AutomationChangeFeatureAction = {
  type: AutomationTypes
  currentProtectionFeature?: AutomationProtectionFeatures
  currentOptimizationFeature?: AutomationOptimizationFeatures
}

export type AutomationChangeFeature = Omit<AutomationChangeFeatureAction, 'type'>

export function automationChangeFeatureReducer(
  state: AutomationChangeFeature,
  action: AutomationChangeFeatureAction,
): AutomationChangeFeature {
  switch (action.type) {
    case 'Protection':
      return { ...state, currentProtectionFeature: action.currentProtectionFeature }
    case 'Optimization':
      return { ...state, currentOptimizationFeature: action.currentOptimizationFeature }
    default:
      return state
  }
}
