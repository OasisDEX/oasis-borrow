enum OpenEarnViewMode {
  Simulate = 'Simulate',
  FAQ = 'FAQ',
}

export const EARN_TAB_CHANGE_SUBJECT = 'earnTabChange'

export type EarnTabChangeAction = { type: 'change-tab'; currentMode: OpenEarnViewMode }

export interface EarnTabChange {
  currentMode: OpenEarnViewMode
}

export function earnTabChangeReducer(
  state: EarnTabChange,
  action: EarnTabChangeAction,
): EarnTabChange {
  switch (action.type) {
    case 'change-tab':
      return { ...state, currentMode: action.currentMode }
    default:
      return state
  }
}
