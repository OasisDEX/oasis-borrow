import type { TabChange, TabChangeAction } from './TabChange.types'

export function tabChangeReducer(state: TabChange, action: TabChangeAction): TabChange {
  switch (action.type) {
    case 'change-tab':
      return { ...state, currentMode: action.currentMode }
    default:
      return state
  }
}
