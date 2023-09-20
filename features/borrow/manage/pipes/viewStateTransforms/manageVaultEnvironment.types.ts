import type { IlkDataChange } from 'blockchain/ilks'
import type { VaultChange } from 'blockchain/vaults.types'
import type { AutomationTriggersChange } from 'features/automation/api/automationTriggersData.types'
import type { BalanceInfoChange } from 'features/shared/balanceInfo'
import type { PriceInfoChange } from 'features/shared/priceInfo'
import type { VaultHistoryChange } from 'features/vaultHistory/vaultHistory'

export type ManageVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | VaultChange
  | VaultHistoryChange
  | AutomationTriggersChange
