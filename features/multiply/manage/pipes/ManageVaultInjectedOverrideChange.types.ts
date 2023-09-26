import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

export interface ManageVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<ManageMultiplyVaultState>
}
