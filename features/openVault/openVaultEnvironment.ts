import { IlkDataChange } from 'blockchain/ilks'
import { BalanceInfoChange } from 'features/shared/balanceInfo'
import { PriceInfoChange } from 'features/shared/priceInfo'

import { OpenVaultChange, OpenVaultState } from './openVault'

export type OpenVaultEnvironmentChange = PriceInfoChange | BalanceInfoChange | IlkDataChange

export function applyOpenVaultEnvironment(
  change: OpenVaultChange,
  state: OpenVaultState,
): OpenVaultState {
  if (change.kind === 'priceInfo') {
    return {
      ...state,
      ...change.priceInfo,
    }
  }

  if (change.kind === 'balanceInfo') {
    return {
      ...state,
      ...change.balanceInfo,
    }
  }

  if (change.kind === 'ilkData') {
    const {
      ilkData: { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor },
    } = change
    return {
      ...state,
      maxDebtPerUnitCollateral,
      ilkDebtAvailable,
      debtFloor,
    }
  }

  return state
}
