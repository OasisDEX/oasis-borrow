export const TAB_CHANGE_SUBJECT = 'tabChange'

export enum VaultViewMode {
  History,
  Protection,
  Overview,
}

export interface TabChange {
  currentMode: VaultViewMode
}
