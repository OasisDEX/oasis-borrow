import { IlkDataChange } from 'blockchain/ilks'
import { VaultChange } from 'blockchain/vaults'
import { PriceInfoChange } from 'features/shared/priceInfo'

import { BalanceInfoChange } from '../shared/balanceInfo'
import { ManageMultiplyVaultState, ManageVaultChange } from './manageMultiplyVault'

export type ManageVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | VaultChange

export function applyManageVaultEnvironment(
  change: ManageVaultChange,
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

  return state
}
