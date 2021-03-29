import { IlkData } from 'blockchain/ilks'
import { UserTokenInfo } from 'features/shared/userTokenInfo'
import { ManageVaultChange, ManageVaultState } from './manageVault'

interface UserTokenInfoChange {
  kind: 'userTokenInfo'
  userTokenInfo: UserTokenInfo
}

interface IlkDataChange {
  kind: 'ilkData'
  ilkData: IlkData
}

export type ManageVaultEnvironmentChange = UserTokenInfoChange | IlkDataChange

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
  return state
}
