import {
  AAVETokens,
  IPosition,
  IRiskRatio,
  ISimplePositionTransition,
  ISimulatedTransition,
  Position,
  PositionTransition,
  strategies,
} from '@oasisdex/dma-library'
import { OpenMultiplyAaveParameters } from 'actions/aave'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { ethNullAddress } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { ProxyType } from 'features/aave/common/StrategyConfigTypes'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

import { getTokenAddresses } from './get-token-addresses'
import {
  AdjustAaveParameters,
  CloseAaveParameters,
  GetOnChainPositionParams,
  ManageAaveParameters,
  OpenAaveDepositBorrowParameters,
} from './types/'

function assertNetwork(networkId: NetworkIds): asserts networkId is NetworkIds.MAINNET {
  if (networkId !== NetworkIds.OPTIMISMMAINNET) {
    throw new Error('Only mainnet is supported')
  }
}

function assertProtocol(protocol: LendingProtocol): asserts protocol is LendingProtocol.AaveV3 {
  if (protocol !== LendingProtocol.AaveV3) {
    throw new Error(`Only Aaave v3 is currently supported`)
  }
}

async function openAave(
  slippage: BigNumber,
  riskRatio: IRiskRatio,
  debtToken: { symbol: AAVETokens; precision: number },
  collateralToken: {
    symbol: AAVETokens
    precision: number
  },
  depositedByUser: {
    collateralToken?: { amountInBaseUnit: BigNumber }
    debtToken?: { amountInBaseUnit: BigNumber }
  },
  positionType: 'Multiply' | 'Earn' | 'Borrow',
  networkId: NetworkIds,
  proxyAddress: string,
  userAddress: string,
  proxyType: ProxyType,
  protocol: AaveLendingProtocol,
) {
  assertNetwork(networkId)
  assertProtocol(protocol)

  const args: Parameters<typeof strategies.aave.v3.open>[0] = {
    slippage,
    multiple: riskRatio,
    debtToken: debtToken,
    collateralToken: collateralToken,
    depositedByUser,
    positionType: positionType,
  }

  const dependencies: Parameters<typeof strategies.aave.v3.open>[1] = {
    addresses: getTokenAddresses(networkId),
    provider: getRpcProvider(networkId),
    getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress, networkId, 'v5.0'),
    proxy: proxyAddress,
    user: proxyAddress !== ethNullAddress ? userAddress : ethNullAddress, // mocking the address before wallet connection
    isDPMProxy: proxyType === ProxyType.DpmProxy,
  }

  return await strategies.aave.v3.open(args, dependencies)
}

export async function getOpenTransaction({
  amount,
  collateralToken,
  debtToken,
  depositToken,
  riskRatio,
  slippage,
  proxyAddress,
  userAddress,
  proxyType,
  positionType,
  protocol,
  networkId,
}: OpenMultiplyAaveParameters): Promise<PositionTransition> {
  const _collateralToken = {
    symbol: collateralToken as AAVETokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as AAVETokens,
    precision: getToken(debtToken).precision,
  }

  let depositedByUser: {
    collateralToken?: {
      amountInBaseUnit: BigNumber
    }
    debtToken?: { amountInBaseUnit: BigNumber }
  }

  if (depositToken === debtToken) {
    depositedByUser = {
      debtToken: {
        amountInBaseUnit: amountToWei(amount, debtToken),
      },
    }
  } else if (depositToken === collateralToken) {
    depositedByUser = {
      collateralToken: {
        amountInBaseUnit: amountToWei(amount, collateralToken),
      },
    }
  } else {
    throw new Error('Token is neither collateral nor debt')
  }
  return openAave(
    slippage,
    riskRatio,
    _debtToken,
    _collateralToken,
    depositedByUser,
    positionType,
    networkId,
    proxyAddress,
    userAddress,
    proxyType,
    protocol,
  )
}

export async function getOnChainPosition({
  networkId,
  proxyAddress,
  collateralToken,
  debtToken,
  protocol,
}: GetOnChainPositionParams): Promise<IPosition> {
  assertNetwork(networkId)

  const provider = getRpcProvider(networkId)

  const _collateralToken = {
    symbol: collateralToken as AAVETokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as AAVETokens,
    precision: getToken(debtToken).precision,
  }

  if (protocol === LendingProtocol.AaveV3) {
    return await strategies.aave.v3.view(
      {
        proxy: proxyAddress,
        collateralToken: _collateralToken,
        debtToken: _debtToken,
      },
      { addresses: getTokenAddresses(networkId), provider },
    )
  }

  throw new Error('Protocol not supported')
}

export async function getAdjustAaveParameters({
  userAddress,
  proxyAddress,
  slippage,
  riskRatio,
  currentPosition,
  proxyType,
  positionType,
  networkId,
}: AdjustAaveParameters): Promise<PositionTransition> {
  assertNetwork(networkId)

  const provider = getRpcProvider(networkId)

  const collateralToken = {
    symbol: currentPosition.collateral.symbol as AAVETokens,
    precision: currentPosition.collateral.precision,
  }

  const debtToken = {
    symbol: currentPosition.debt.symbol as AAVETokens,
    precision: currentPosition.debt.precision,
  }

  type strategyArguments = Parameters<typeof strategies.aave.v3.adjust>[0]
  type strategyDependencies = Parameters<typeof strategies.aave.v3.adjust>[1]

  const args: strategyArguments = {
    slippage,
    multiple: riskRatio,
    debtToken: debtToken,
    collateralToken: collateralToken,
    positionType,
  }

  const stratDeps: strategyDependencies = {
    addresses: getTokenAddresses(networkId),
    currentPosition,
    provider: provider,
    getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
  }

  return await strategies.aave.v3.adjust(args, stratDeps)
}

export async function getManageAaveParameters(
  _parameters: ManageAaveParameters,
): Promise<PositionTransition> {
  throw new Error('Not implemented')
}

export async function getCloseAaveParameters({
  proxyAddress,
  userAddress,
  slippage,
  currentPosition,
  proxyType,
  shouldCloseToCollateral,
  protocol,
  networkId,
  positionType,
}: CloseAaveParameters): Promise<PositionTransition> {
  assertNetwork(networkId)

  const collateralToken = {
    symbol: currentPosition.collateral.symbol as AAVETokens,
    precision: currentPosition.collateral.precision,
  }

  const debtToken = {
    symbol: currentPosition.debt.symbol as AAVETokens,
    precision: currentPosition.debt.precision,
  }

  type closeParameters = Parameters<typeof strategies.aave.v3.close>
  const stratArgs: closeParameters[0] = {
    slippage,
    debtToken,
    collateralToken,
    collateral: {
      amount: currentPosition.collateral.amount,
    },
    shouldCloseToCollateral,
    positionType: positionType,
  }

  const stratDeps: closeParameters[1] = {
    addresses: getTokenAddresses(networkId),
    currentPosition,
    provider: getRpcProvider(networkId),
    getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
  }

  switch (protocol) {
    case LendingProtocol.AaveV3:
      return strategies.aave.v3.close(stratArgs, stratDeps)
    default:
      throw new Error('Protocol not supported')
  }
}

export async function getOpenDepositBorrowParameters(
  _args: OpenAaveDepositBorrowParameters,
): Promise<ISimplePositionTransition> {
  throw new Error('Not implemented')
}

export function getEmptyPosition(collateral: string, debt: string) {
  return new Position(
    {
      amount: zero,
      symbol: debt,
      precision: getToken(debt).precision,
    },
    {
      amount: zero,
      symbol: collateral,
      precision: getToken(collateral).precision,
    },
    zero,
    {
      maxLoanToValue: zero,
      liquidationThreshold: zero,
      dustLimit: zero,
    },
  )
}

export function transitionHasSwap(
  transition?: ISimplePositionTransition,
): transition is PositionTransition {
  return !!transition && (transition.simulation as ISimulatedTransition).swap !== undefined
}

export function transitionHasMinConfigurableRiskRatio(
  transition?: ISimplePositionTransition,
): transition is PositionTransition {
  return (
    !!transition &&
    (transition.simulation as ISimulatedTransition).minConfigurableRiskRatio !== undefined
  )
}

// library works with a normalised precision of 18, and is sometimes exposed in the API.
export const NORMALISED_PRECISION = new BigNumber(18)
