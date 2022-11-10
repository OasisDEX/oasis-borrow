import BigNumber from 'bignumber.js'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'

interface GetAutomationEnvironmentParams {
  generalManageVault: GeneralManageVaultState
  vaultProtocol: VaultProtocol
}

interface AutomationEnvironment {
  controller?: string
  ethBalance: BigNumber
  nextCollateralPrice: BigNumber
  token: string
}

export function getAutomationEnvironment({
  generalManageVault,
  vaultProtocol,
}: GetAutomationEnvironmentParams): AutomationEnvironment {
  switch (vaultProtocol) {
    case VaultProtocol.Maker:
      const {
        balanceInfo: { ethBalance },
        vault: { token, controller },
        priceInfo: { nextCollateralPrice },
      } = generalManageVault.state

      return {
        controller,
        ethBalance,
        nextCollateralPrice,
        token,
      }
    case VaultProtocol.Aave:
      return {
        controller: '',
        ethBalance: zero,
        nextCollateralPrice: zero,
        token: '',
      }
    default:
      throw new UnreachableCaseError(vaultProtocol)
  }
}
