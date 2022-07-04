import { IlkDataChange } from 'blockchain/ilks'
import { VaultChange } from 'blockchain/vaults'
import { PriceInfoChange } from 'features/shared/priceInfo'
import { SlippageChange } from 'features/userSettings/userSettings'

import { AutomationTriggersChange } from '../../../automation/protection/triggers/AutomationTriggersData'
import { BalanceInfoChange } from '../../../shared/balanceInfo'
import { VaultHistoryChange } from '../../../vaultHistory/vaultHistory'
import { ManageMultiplyVaultChange, ManageMultiplyVaultState } from './manageMultiplyVault'

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
      basicSellData: change.basicSellData,
      basicBuyData: change.basicBuyData,
    }
  }

  return state
}
