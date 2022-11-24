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
    context: { tokenPrice, token, collateralToken, protocolData },
  } = aaveManageVault
  const ilkOrToken = strategyConfig.tokens?.collateral!

  const {
    position: {
      riskRatio: { loanToValue },
      category: { maxLoanToValue, dustLimit },
      debt,
      collateral,
    },
  } = protocolData!

  // it is dummy calculation for now, most likely incorrect
  // will be provided by earn team
  const liquidationPrice =
    tokenPrice?.times(debt.amount).div(collateral.amount.times(loanToValue)) || zero

  return {
    positionRatio: loanToValue.decimalPlaces(4),
    nextPositionRatio: loanToValue.decimalPlaces(4),
    debt: debt.amount,
    debtFloor: dustLimit,
    debtOffset: zero,
    id: new BigNumber(parseInt(address, 16)),
    ilk: ilkOrToken,
    liquidationPenalty: liquidationBonus.div(10000),
    liquidationPrice,
    liquidationRatio: maxLoanToValue,
    lockedCollateral: collateral.amount,
    owner: address,
    token: collateralToken,
    debtToken: token,
    vaultType,
  }
}
