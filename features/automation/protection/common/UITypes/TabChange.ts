import { VaultViewMode } from 'components/vault/GeneralManageTabBar'

import { EarnSimulateViewMode } from '../../../../earn/guni/open/containers/GuniOpenMultiplyVaultDetails'

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
