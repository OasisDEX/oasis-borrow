import BigNumber from 'bignumber.js'
import { AutomationPositionData } from 'components/AutomationContextProvider'
import { AaveManageVaultState } from 'features/automation/contexts/AaveAutomationContext'
import { VaultType } from 'features/generalManageVault/vaultType'
import { one, zero } from 'helpers/zero'

interface GetAutomationAavePositionDataParams {
  aaveManageVault: AaveManageVaultState
  vaultType?: VaultType
}

export function getAutomationAavePositionData({
  aaveManageVault,
  vaultType = VaultType.Borrow,
}: GetAutomationAavePositionDataParams): AutomationPositionData {
  const {
    address,
    aaveProtocolData: {
      accountData: { ltv, totalDebtETH, currentLiquidationThreshold, totalCollateralETH },
      position,
    },
    aaveReserveState: { liquidationBonus },
    strategyConfig,
  } = aaveManageVault

  const ilkOrToken = strategyConfig.tokens?.collateral!

  return {
    positionRatio: one.div(ltv.div(10000)),
    nextPositionRatio: one.div(ltv.div(10000)),
    debt: totalDebtETH,
    debtFloor: position.category.dustLimit,
    debtOffset: zero,
    id: new BigNumber(parseInt(address, 16)),
    ilk: ilkOrToken,
    liquidationPenalty: liquidationBonus.div(10000),
    liquidationPrice: position.liquidationPrice,
    liquidationRatio: currentLiquidationThreshold.div(10000),
    lockedCollateral: totalCollateralETH,
    owner: address,
    token: ilkOrToken,
    vaultType,
  }
}
