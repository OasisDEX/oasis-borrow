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
    aaveReserveState: { liquidationBonus },
    strategyConfig,
    context: {
      tokens: { debt: debtToken, collateral: collateralToken },
      protocolData,
      proxyAddress,
      positionId: { vaultId },
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

  const id = new BigNumber(vaultId!)

  const lockedCollateral = amountFromWei(collateral.amount, collateral.precision)
  const positionDebt = amountFromWei(debt.amount, debt.precision)

  const liquidationPrice = positionDebt.div(lockedCollateral.times(liquidationThreshold)) || zero

  return {
    positionRatio: loanToValue.decimalPlaces(4),
    nextPositionRatio: loanToValue.decimalPlaces(4),
    debt: positionDebt,
    debtFloor: dustLimit,
    debtOffset: zero,
    id,
    ilk: ilkOrToken,
    liquidationPenalty: liquidationBonus.div(10000),
    liquidationPrice,
    liquidationRatio: liquidationThreshold,
    lockedCollateral,
    owner: proxyAddress!,
    token: collateralToken,
    debtToken: debtToken,
    vaultType,
    // TODO missing types in lib?
    // @ts-ignore
    debtTokenAddress: debt.address,
    // @ts-ignore
    tokenAddress: collateral.address,
  }
}
