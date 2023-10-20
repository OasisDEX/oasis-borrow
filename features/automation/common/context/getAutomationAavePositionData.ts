import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { AutomationPositionData } from 'components/context/AutomationContextProvider'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { zero } from 'helpers/zero'

import type { GetAutomationAavePositionDataParams } from './getAutomationAavePositionData.types'

export function getAutomationAavePositionData({
  aaveManageVault,
  vaultType = VaultType.Borrow,
}: GetAutomationAavePositionDataParams): AutomationPositionData {
  const {
    aaveReserveState: { liquidationBonus },
    strategyConfig,
    context: {
      tokens: { debt: debtToken, collateral: collateralToken },
      proxyAddress,
      positionId: { vaultId },
      web3Context,
      currentPosition,
    },
  } = aaveManageVault
  const ilkOrToken = strategyConfig.tokens?.collateral!

  const {
    riskRatio: { loanToValue },
    category: { dustLimit, liquidationThreshold },
    debt,
    collateral,
  } = currentPosition!

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
    debtTokenAddress: getNetworkContracts(NetworkIds.MAINNET, web3Context!.chainId).tokens[
      debtToken
    ].address,
    collateralTokenAddress: getNetworkContracts(NetworkIds.MAINNET, web3Context!.chainId).tokens[
      collateralToken
    ].address,
  }
}
