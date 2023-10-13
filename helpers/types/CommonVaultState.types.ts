import { OpenVaultState } from 'features/borrow/open/pipes/openVault.types'
import type { OpenGuniVaultState } from 'features/earn/guni/open/pipes/openGuniVault.types'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import type { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault.types'

export type CommonVaultState =
  | OpenVaultState
  | OpenMultiplyVaultState
  | ManageMultiplyVaultState
  | OpenGuniVaultState
