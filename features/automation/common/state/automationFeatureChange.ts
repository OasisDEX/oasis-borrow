import type {
  AutomationChangeFeature,
  AutomationChangeFeatureAction,
} from './automationFeatureChange.types'

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
