import { IlkDataChange } from 'blockchain/ilks'
import { priceInfoChange } from 'features/shared/priceInfo'

import { OpenVaultChange, OpenVaultState } from './openVault'

export type OpenVaultEnvironmentChange = priceInfoChange | IlkDataChange

export function applyOpenVaultEnvironment(
  change: OpenVaultChange,
  state: OpenVaultState,
): OpenVaultState {
  if (change.kind === 'userTokenInfo') {
    return {
      ...state,
      ...change.userTokenInfo,
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
