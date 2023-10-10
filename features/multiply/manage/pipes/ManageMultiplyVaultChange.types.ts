import type { ExchangeQuoteChanges } from './manageMultiplyQuote.types'
import type { ManageVaultAllowanceChange } from './manageMultiplyVaultAllowances.types'
import type { ManageVaultEnvironmentChange } from './manageMultiplyVaultEnvironment.types'
import type { ManageVaultFormChange } from './manageMultiplyVaultForm.types'
import type { ManageVaultInputChange } from './manageMultiplyVaultInput.types'
import type { ManageVaultTransactionChange } from './manageMultiplyVaultTransactions.types'
import type { ManageVaultTransitionChange } from './manageMultiplyVaultTransitions.types'
import type { ManageVaultInjectedOverrideChange } from './ManageVaultInjectedOverrideChange.types'

export type ManageMultiplyVaultChange =
  | ManageVaultInputChange
  | ManageVaultFormChange
  | ManageVaultAllowanceChange
  | ManageVaultTransitionChange
  | ManageVaultTransactionChange
  | ManageVaultEnvironmentChange
  | ManageVaultInjectedOverrideChange
  | ExchangeQuoteChanges
