import { AutomationPositionData } from 'components/AutomationContextProvider'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'

interface GetAutomationMakerPositionDataParams {
  generalManageVault: GeneralManageVaultState
}

export function getAutomationMakerPositionData({
  generalManageVault,
}: GetAutomationMakerPositionDataParams): AutomationPositionData {
  const {
    vault: {
      collateralizationRatio,
      collateralizationRatioAtNextPrice,
      debt,
      debtOffset,
      id,
      ilk,
      liquidationPrice,
      lockedCollateral,
      owner,
      token,
    },
    ilkData: { liquidationRatio, debtFloor, liquidationPenalty },
  } = generalManageVault.state

  return {
    positionRatio: collateralizationRatio,
    nextPositionRatio: collateralizationRatioAtNextPrice,
    debt,
    debtFloor,
    debtOffset,
    id,
    ilk,
    liquidationPenalty,
    liquidationPrice,
    liquidationRatio,
    lockedCollateral,
    owner,
    token,
    debtToken: 'DAI',
    vaultType: generalManageVault.type,
  }
}
