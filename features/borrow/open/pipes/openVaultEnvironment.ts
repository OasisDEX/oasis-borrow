import type { IlkDataChange } from 'blockchain/ilks'
import type { BalanceInfoChange } from 'features/shared/balanceInfo'
import type { PriceInfoChange } from 'features/shared/priceInfo'

import type { OpenVaultChange, OpenVaultState } from './openVault'

export type OpenVaultEnvironmentChange = PriceInfoChange | BalanceInfoChange | IlkDataChange

export function applyOpenVaultEnvironment(
  state: OpenVaultState,
  change: OpenVaultChange,
): OpenVaultState {
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

  return state
}
