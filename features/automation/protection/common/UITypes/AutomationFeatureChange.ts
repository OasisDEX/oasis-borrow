type AutomationKinds = 'Protection' | 'Optimization'
export type AutomationProtectionFeatures = 'stopLoss' | 'autoSell'
export type AutomationOptimizationFeatures = 'autoBuy' | 'constantMultiple'

export const AUTOMATION_CHANGE_FEATURE = 'automationChangeFeature'

export type AutomationChangeFeatureAction = {
  type: AutomationKinds
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
