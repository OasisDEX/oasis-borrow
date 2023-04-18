import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { OpenAaveContext } from 'features/aave/open/state'
import { zero } from 'helpers/zero'

interface AaveStopLossDataInput {
  collateralToken: string
  debtToken: string
  positionRatio: BigNumber
  liquidationPrice: BigNumber
  debt: BigNumber
  lockedCollateral: BigNumber
  proxyAddress?: string
  liquidationPenalty: BigNumber
  liquidationRatio: BigNumber
  debtTokenAddress: string
  collateralTokenAddress: string
  stopLossLevel: BigNumber
  collateralActive: boolean
}

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
    debtTokenAddress: getNetworkContracts(context.web3Context!.chainId).tokens[debtToken].address,
    collateralTokenAddress: getNetworkContracts(context.web3Context!.chainId).tokens[
      collateralToken
    ].address,
    stopLossLevel: context.stopLossLevel || zero,
    collateralActive: context.collateralActive || false,
  }
}
