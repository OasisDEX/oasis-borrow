import { VaultViewMode } from 'components/VaultTabSwitch'

export const TAB_CHANGE_SUBJECT = 'tabChange'

export interface TabChange {
  currentMode: VaultViewMode
}
