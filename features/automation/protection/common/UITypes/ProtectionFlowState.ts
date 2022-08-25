export const PROTECTION_STATE_UPDATE = 'ProtectionStateUpdate'

export type ProtectionStateUpdateAction = {
  type: 'is-confirmation'
  isConfirmation: boolean
}

export type ProtectionState = {
  isConfirmation: boolean
}

export function protectionStateReducer(
  state: ProtectionState,
  action: ProtectionStateUpdateAction,
): ProtectionState {
  switch (action.type) {
    case 'is-confirmation':
      return { ...state, isConfirmation: action.isConfirmation }
    default:
      return state
  }
}
