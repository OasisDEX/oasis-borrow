import { IlkDataChange } from 'blockchain/ilks'
import { VaultChange } from 'blockchain/vaults'
import { PriceInfoChange } from 'features/shared/priceInfo'
import { SlippageChange } from 'features/userSettings/userSettings'

import { StopLossChange } from '../../../automation/triggers/AutomationTriggersData'
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
  | StopLossChange

export function applyManageVaultEnvironment(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
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

  if (change.kind === 'stopLossData') {
    return {
      ...state,
      stopLossData: change.stopLossData,
    }
  }

  return state
}
