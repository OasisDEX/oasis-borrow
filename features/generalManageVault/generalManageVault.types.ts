import type { ManageEarnVaultState } from 'features/earn/guni/manage/pipes/manageGuniVault.types'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'

import type { VaultType } from './vaultType.types'

export type WithToggle<T> = T & { toggleVaultType: () => void }

export type GeneralManageVaultState =
  | {
      type: VaultType.Borrow
      state: WithToggle<ManageMultiplyVaultState>
    }
  | {
      type: VaultType.Multiply
      state: WithToggle<ManageMultiplyVaultState>
    }
  | {
      type: VaultType.Earn
      state: WithToggle<ManageEarnVaultState>
    }
