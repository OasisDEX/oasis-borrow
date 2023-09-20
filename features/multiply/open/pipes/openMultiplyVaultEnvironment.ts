import type { IlkDataChange } from 'blockchain/ilks'
import type { BalanceInfoChange } from 'features/shared/balanceInfo'
import type { PriceInfoChange } from 'features/shared/priceInfo'
import type { SlippageChange } from 'features/userSettings/userSettings'

import type { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault'

export type OpenVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | SlippageChange

export function applyOpenVaultEnvironment(
  state: OpenMultiplyVaultState,
  change: OpenMultiplyVaultChange,
): OpenMultiplyVaultState {
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

  if (change.kind === 'slippage') {
    return {
      ...state,
      slippage: change.slippage,
    }
  }

  return state
}
