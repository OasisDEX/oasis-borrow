import type { ManageInstiVaultState } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter.types'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import type { ManageEarnVaultState } from 'features/earn/guni/manage/pipes/manageGuniVault.types'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'

import type { VaultType } from './vaultType.types'

export type WithToggle<T> = T & { toggleVaultType: () => void }

export type GeneralManageVaultState =
  | {
      type: VaultType.Insti
      state: WithToggle<ManageInstiVaultState>
    }
  | {
      type: VaultType.Borrow
      state: WithToggle<ManageStandardBorrowVaultState>
    }
  | {
      type: VaultType.Multiply
      state: WithToggle<ManageMultiplyVaultState>
    }
  | {
      type: VaultType.Earn
      state: WithToggle<ManageEarnVaultState>
    }
