import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
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
      web3Context,
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
    positionRatio: loanToValue.decimalPlaces(5),
    nextPositionRatio: loanToValue.decimalPlaces(5),
    debt: positionDebt,
    debtFloor: dustLimit,
    debtOffset: zero,
    id: new BigNumber(vaultId!),
    ilk: ilkOrToken,
    liquidationPenalty: liquidationBonus,
    liquidationPrice,
    liquidationRatio: liquidationThreshold,
    lockedCollateral,
    owner: proxyAddress!,
    token: collateralToken,
    debtToken: debtToken,
    vaultType,
    debtTokenAddress: getNetworkContracts(web3Context!.chainId).tokens[debtToken].address,
    collateralTokenAddress: getNetworkContracts(web3Context!.chainId).tokens[collateralToken]
      .address,
  }
}
