import { CommandContractType, TriggerType } from '@oasisdex/automation'
import { amountFromWei } from '@oasisdex/utils'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { OpenAaveContext } from 'features/aave/open/state'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

import type { AaveStopLossDataInput } from './helpers.types'

export function extractStopLossDataInput(context: OpenAaveContext): AaveStopLossDataInput {
  const collateralToken = context.tokens.collateral
  const debtToken = context.tokens.debt

  const debt = amountFromWei(
    context.transition?.simulation.position.debt.amount || zero,
    context.transition?.simulation.position.debt.precision,
  )

  const lockedCollateral = amountFromWei(
    context.transition?.simulation.position.collateral.amount || zero,
    context.transition?.simulation.position.collateral.precision,
  )
  const liquidationRatio =
    context?.transition?.simulation.position.category.liquidationThreshold || zero
  const liquidationPrice = debt.div(lockedCollateral.times(liquidationRatio)) || zero

  return {
    collateralToken,
    debtToken,
    proxyAddress: context.effectiveProxyAddress,
    positionRatio: context.transition?.simulation.position.riskRatio.loanToValue || zero,
    lockedCollateral,
    debt,
    liquidationPrice,
    liquidationPenalty: context.strategyInfo?.liquidationBonus || zero,
    liquidationRatio,
    debtTokenAddress: getNetworkContracts(NetworkIds.MAINNET, context.web3Context!.chainId).tokens[
      debtToken
    ].address,
    collateralTokenAddress: getNetworkContracts(NetworkIds.MAINNET, context.web3Context!.chainId)
      .tokens[collateralToken].address,
    stopLossLevel: context.stopLossLevel || zero,
    collateralActive: context.collateralActive || false,
  }
}

export function getAveeStopLossTriggerType(protocol: LendingProtocol): TriggerType {
  if (!protocol) {
    throw new Error('Protocol is not defined')
  }

  switch (protocol) {
    case LendingProtocol.SparkV3:
      return TriggerType.SparkStopLossToDebtV2

    default:
      return TriggerType.AaveStopLossToDebtV2
  }
}

export function getAaveLikeCommandContractType(protocol: LendingProtocol) {
  switch (protocol) {
    case LendingProtocol.SparkV3:
      return CommandContractType.SparkStopLossCommandV2
    case LendingProtocol.AaveV3:
      return CommandContractType.AaveStopLossCommandV2
    default:
      return CommandContractType.AaveStopLossCommandV2
  }
}
