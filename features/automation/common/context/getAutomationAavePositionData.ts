import { AutomationPositionData } from 'components/AutomationContextProvider'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { zero } from 'helpers/zero'

interface getAutomationAavePositionDataParams {
  generalManageVault: GeneralManageVaultState
}

export function getAutomationAavePositionData({
  generalManageVault,
}: getAutomationAavePositionDataParams): AutomationPositionData {
  //TODO: fill with actual AAVE data
  return {
    collateralizationRatio: zero,
    collateralizationRatioAtNextPrice: zero,
    debt: zero,
    debtFloor: zero,
    debtOffset: zero,
    id: zero,
    ilk: '',
    liquidationPenalty: zero,
    liquidationPrice: zero,
    liquidationRatio: zero,
    lockedCollateral: zero,
    owner: '',
    token: '',
    vaultType: generalManageVault.type,
  }
}
