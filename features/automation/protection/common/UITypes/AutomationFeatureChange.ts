type AutomationFeatures = 'stopLoss' | 'autoBuy' | 'autoSell' | 'constantMultiply' | null

export const AUTOMATION_CHANGE_FEATURE = 'optimizationChangeFeature'

export type AutomationChangeFeatureAction = { currentFeature: AutomationFeatures }

export interface AutomationChangeFeature {
  currentFeature: AutomationFeatures
}

export function automationChangeFeatureReducer(
  state: AutomationChangeFeature,
  action: AutomationChangeFeatureAction,
): AutomationChangeFeature {
  return { ...state, currentFeature: action.currentFeature }
}
