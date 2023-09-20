import type { IlkDataChange } from 'blockchain/ilks'
import type { VaultChange } from 'blockchain/vaults.types'
import type { AutomationTriggersChange } from 'features/automation/api/automationTriggersData.types'
import type { BalanceInfoChange } from 'features/shared/balanceInfo'
import type { PriceInfoChange } from 'features/shared/priceInfo'
import type { SlippageChange } from 'features/userSettings/userSettings'
import type { VaultHistoryChange } from 'features/vaultHistory/vaultHistory'

import type { ManageMultiplyVaultChange, ManageMultiplyVaultState } from './types'

export type ManageVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | VaultChange
  | VaultHistoryChange
  | SlippageChange
  | AutomationTriggersChange

export function applyManageVaultEnvironment<VS extends ManageMultiplyVaultState>(
  change: ManageMultiplyVaultChange,
  state: VS,
): VS {
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

  if (change.kind === 'slippage') {
    return {
      ...state,
      slippage: change.slippage,
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
