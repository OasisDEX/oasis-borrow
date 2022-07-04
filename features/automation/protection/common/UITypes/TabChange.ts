import { VaultViewMode } from 'components/vault/GeneralManageTabBar'

export const TAB_CHANGE_SUBJECT = 'tabChange'

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
