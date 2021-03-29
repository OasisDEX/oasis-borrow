import { IlkData, IlkDataChange } from 'blockchain/ilks'
import { VaultChange } from 'blockchain/vaults'
import { UserTokenInfo, UserTokenInfoChange } from 'features/shared/userTokenInfo'
import { ManageVaultChange, ManageVaultState } from './manageVault'

export type ManageVaultEnvironmentChange = UserTokenInfoChange | IlkDataChange | VaultChange

export function applyManageVaultEnvironment(
  change: ManageVaultChange,
  state: ManageVaultState,
): ManageVaultState {
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

  if (change.kind === 'vault') {
    const {
      vault: {
        lockedCollateral,
        debt,
        collateralizationRatio,
        liquidationPrice,
        lockedCollateralPrice,
        freeCollateral,
        stabilityFee,
        liquidationPenalty,
      },
    } = change

    return {
      ...state,
      lockedCollateral,
      debt,
      collateralizationRatio,
      liquidationPrice,
      lockedCollateralPrice,
      freeCollateral,
      stabilityFee,
      liquidationPenalty,
    }
  }

  return state
}
