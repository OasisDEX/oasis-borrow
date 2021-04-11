import { IlkDataChange } from 'blockchain/ilks'
import { VaultChange } from 'blockchain/vaults'
import { PriceInfoChange } from 'features/shared/priceInfo'

import { BalanceInfoChange } from '../shared/balanceInfo'
import { ManageVaultChange, ManageVaultState } from './manageVault'

export type ManageVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | VaultChange

export function applyManageVaultEnvironment(
  change: ManageVaultChange,
  state: ManageVaultState,
): ManageVaultState {
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

  if (change.kind === 'vault') {
    const {
      vault: {
        lockedCollateral,
        debt,
        collateralizationRatio,
        nextCollateralizationRatio,
        liquidationPrice,
        lockedCollateralUSD,
        freeCollateral,
        freeCollateralUSD,
        stabilityFee,
        liquidationPenalty,
      },
    } = change

    return {
      ...state,
      lockedCollateral,
      debt,
      collateralizationRatio,
      nextCollateralizationRatio,
      liquidationPrice,
      lockedCollateralUSD,
      maxWithdrawAmount: freeCollateral,
      maxWithdrawAmountUSD: freeCollateralUSD,
      stabilityFee,
      liquidationPenalty,
    }
  }

  return state
}
