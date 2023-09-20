import type { IlkDataChange } from 'blockchain/ilks.types'
import type { BalanceInfoChange } from 'features/shared/balanceInfo.types'
import type { PriceInfoChange } from 'features/shared/priceInfo.types'
import type { SlippageChange } from 'features/userSettings/userSettings'

import type { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault.types'

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
