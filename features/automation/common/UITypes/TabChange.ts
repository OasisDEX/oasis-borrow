export const TAB_CHANGE_SUBJECT = 'tabChange'

export enum VaultViewMode {
  History,
  Protection,
  Overview,
}

export type TabChangeAction = { type: 'change-tab'; currentMode: VaultViewMode }

export interface TabChange {
  currentMode: VaultViewMode
}

export function tabChangeReducer(state: TabChange, action: TabChangeAction): TabChange {
  switch (action.type) {
    case 'change-tab':
      return { ...state, currentMode: action.currentMode }
    default:
      return state
  }
}
