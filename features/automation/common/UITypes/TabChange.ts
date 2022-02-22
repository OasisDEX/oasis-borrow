import { VaultViewMode } from 'components/TabSwitchLayout'

export const TAB_CHANGE_SUBJECT = 'tabChange'

export interface TabChange {
  currentMode: VaultViewMode
}
