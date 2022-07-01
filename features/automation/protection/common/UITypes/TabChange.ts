import { EarnSimulateViewMode } from 'components/vault/EarnVaultSimulateTabBar'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'

export const TAB_CHANGE_SUBJECT = 'tabChange'

export type TabChangeAction = {
  type: 'change-tab'
  currentMode: VaultViewMode | EarnSimulateViewMode
}

export interface TabChange {
  currentMode: VaultViewMode | EarnSimulateViewMode
}

export function tabChangeReducer(state: TabChange, action: TabChangeAction): TabChange {
  switch (action.type) {
    case 'change-tab':
      return { ...state, currentMode: action.currentMode }
    default:
      return state
  }
}
