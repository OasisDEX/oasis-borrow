import type { IlkDataChange } from 'blockchain/ilks.types'
import type { VaultChange } from 'blockchain/vaults.types'
import type { AutomationTriggersChange } from 'features/automation/api/AutomationTriggersChange.types'
import type { BalanceInfoChange } from 'features/shared/balanceInfo.types'
import type { PriceInfoChange } from 'features/shared/priceInfo.types'
import type { VaultHistoryChange } from 'features/vaultHistory/vaultHistory.types'

export type ManageVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | VaultChange
  | VaultHistoryChange
  | AutomationTriggersChange
