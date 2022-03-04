export const PROTECTION_MODE_CHANGE_SUBJECT = 'ProtectionModeChange'

export enum AutomationFromKind {
  ADJUST,
  CANCEL,
}

export interface ProtectionModeChange {
  currentMode: AutomationFromKind
}
