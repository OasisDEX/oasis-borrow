import { AutomationPositionData } from 'components/AutomationContextProvider'
import { getAutomationAavePositionData } from 'features/automation/common/context/getAutomationAavePositionData'
import { getAutomationMakerPositionData } from 'features/automation/common/context/getAutomationMakerPositionData'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'

interface GetAutomationPositionDataParams {
  generalManageVault: GeneralManageVaultState
  vaultProtocol: VaultProtocol
}

export function getAutomationPositionData({
  generalManageVault,
  vaultProtocol,
}: GetAutomationPositionDataParams): AutomationPositionData {
  switch (vaultProtocol) {
    case VaultProtocol.Maker:
      return getAutomationMakerPositionData({ generalManageVault })
    case VaultProtocol.Aave:
      return getAutomationAavePositionData({ generalManageVault })
    default:
      throw new UnreachableCaseError(vaultProtocol)
  }
}
