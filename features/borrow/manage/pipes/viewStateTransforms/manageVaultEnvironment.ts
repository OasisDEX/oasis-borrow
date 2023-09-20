import type { IlkDataChange } from 'blockchain/ilks'
import type { VaultChange } from 'blockchain/vaults.types'
import type { AutomationTriggersChange } from 'features/automation/api/automationTriggersData'
import type {
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from 'features/borrow/manage/pipes/manageVault'
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

export function applyManageVaultEnvironment<VaultState extends ManageStandardBorrowVaultState>(
  change: ManageVaultChange,
  state: VaultState,
): VaultState {
  if (change.kind === 'priceInfo') {
    return {
      ...state,
      priceInfo: change.priceInfo,
    }
  }

  if (change.kind === 'balanceInfo') {
    return {
      ...state,
      balanceInfo: change.balanceInfo,
    }
  }

  if (change.kind === 'ilkData') {
    return {
      ...state,
      ilkData: change.ilkData,
    }
  }

  if (change.kind === 'vault') {
    return {
      ...state,
      vault: change.vault,
    }
  }

  if (change.kind === 'vaultHistory') {
    return {
      ...state,
      vaultHistory: change.vaultHistory,
    }
  }

  if (change.kind === 'automationTriggersData') {
    return {
      ...state,
      stopLossData: change.stopLossData,
      autoSellData: change.autoSellData,
      autoBuyData: change.autoBuyData,
      constantMultipleData: change.constantMultipleData,
      autoTakeProfitData: change.autoTakeProfitData,
    }
  }

  return state
}
