import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { AutomationPositionData } from 'components/AutomationContextProvider'
import { AaveManageVaultState } from 'features/automation/contexts/AaveAutomationContext'
import { VaultType } from 'features/generalManageVault/vaultType'
import { zero } from 'helpers/zero'

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
    aaveReserveState: { liquidationBonus },
    strategyConfig,
    context: {
      tokens: { debt: debtToken, collateral: collateralToken },
      protocolData,
    },
  } = aaveManageVault
  const ilkOrToken = strategyConfig.tokens?.collateral!

  const {
    position: {
      riskRatio: { loanToValue },
      category: { dustLimit, liquidationThreshold },
      debt,
      collateral,
    },
  } = protocolData!

  const lockedCollateral = amountFromWei(collateral.amount, collateral.precision)
  const positionDebt = amountFromWei(debt.amount, debt.precision)

  const liquidationPrice = positionDebt.div(lockedCollateral.times(liquidationThreshold)) || zero

  return {
    positionRatio: loanToValue.decimalPlaces(4),
    nextPositionRatio: loanToValue.decimalPlaces(4),
    debt: positionDebt,
    debtFloor: dustLimit,
    debtOffset: zero,
    id: new BigNumber(parseInt(address, 16)),
    ilk: ilkOrToken,
    liquidationPenalty: liquidationBonus.div(10000),
    liquidationPrice,
    liquidationRatio: liquidationThreshold,
    lockedCollateral,
    owner: address,
    token: collateralToken,
    debtToken: debtToken,
    vaultType,
  }
}
