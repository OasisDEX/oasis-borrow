export const PROTECTION_MODE_CHANGE_SUBJECT = 'ProtectionModeChange'

export enum AutomationFromKind {
  ADJUST,
  CANCEL,
}

export type ProtectionModeChangeAction = { type: 'change-mode'; currentMode: AutomationFromKind }

export type ProtectionModeChange = {
  currentMode: AutomationFromKind
}

export function protectionModeChangeReducer(
  state: ProtectionModeChange,
  action: ProtectionModeChangeAction,
): ProtectionModeChange {
  switch (action.type) {
    case 'change-mode':
      return { ...state, currentMode: action.currentMode }
    default:
      return state
  }
}
