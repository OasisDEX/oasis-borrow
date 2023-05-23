import {
  AAVEStrategyAddresses,
  AAVETokens,
  IPosition,
  IPositionTransition,
  IRiskRatio,
  ISimplePositionTransition,
  ISimulatedTransition,
  Position,
  strategies,
  ZERO,
} from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networkIds'
import { ethNullAddress } from 'blockchain/networksConfig'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import { ProxyType } from 'features/aave/common/StrategyConfigTypes'
import { getRpcProvider } from 'helpers/get-rpc-provider'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

import { getTokenAddresses } from './getTokenAddresses'
import {
  AdjustAaveParameters,
  CloseAaveParameters,
  GetOnChainPositionParams,
  ManageAaveParameters,
  OpenAaveDepositBorrowParameters,
  OpenMultiplyAaveParameters,
} from './types/'

// todo: export from oasis-actions
type Swap2 = {
  fromTokenAmount: BigNumber
  minToTokenAmount: BigNumber
  tokenFee: BigNumber
  collectFeeFrom: 'sourceToken' | 'targetToken'
  sourceToken: { symbol: string; precision: number }
  targetToken: { symbol: string; precision: number }
}

export function getFee(swap: Swap2): BigNumber {
  return swap.tokenFee.div(new BigNumber(10).pow(swap[swap.collectFeeFrom].precision))
}

function assertNetwork(networkId: NetworkIds): asserts networkId is NetworkIds.MAINNET {
  if (networkId !== NetworkIds.MAINNET) {
    throw new Error('Only mainnet is supported')
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

  const args: Parameters<typeof strategies.aave.v2.open>[0] &
    Parameters<typeof strategies.aave.v3.open>[0] = {
    slippage,
    multiple: riskRatio,
    debtToken: debtToken,
    collateralToken: collateralToken,
    depositedByUser,
    positionType: positionType,
  }

  const dependencies: Parameters<typeof strategies.aave.v2.open>[1] &
    Parameters<typeof strategies.aave.v3.open>[1] = {
    addresses: getTokenAddresses(networkId),
    provider: getRpcProvider(networkId),
    getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress),
    proxy: proxyAddress,
    user: proxyAddress !== ethNullAddress ? userAddress : ethNullAddress, // mocking the address before wallet connection
    isDPMProxy: proxyType === ProxyType.DpmProxy,
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      return await strategies.aave.v2.open(args, dependencies)
    case LendingProtocol.AaveV3:
      return await strategies.aave.v3.open(args, dependencies)
    default:
      throw new Error('Unsupported protocol')
  }
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
}: OpenMultiplyAaveParameters): Promise<IPositionTransition> {
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

  if (protocol === LendingProtocol.AaveV2) {
    return await strategies.aave.v2.view(
      {
        proxy: proxyAddress,
        collateralToken: _collateralToken,
        debtToken: _debtToken,
      },
      { addresses: getTokenAddresses(networkId), provider },
    )
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
  protocol,
  networkId,
}: AdjustAaveParameters): Promise<IPositionTransition> {
  try {
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

    type strategyArguments = Parameters<typeof strategies.aave.v2.adjust>[0] &
      Parameters<typeof strategies.aave.v3.adjust>[0]
    type strategyDependencies = Parameters<typeof strategies.aave.v2.adjust>[1] &
      Parameters<typeof strategies.aave.v3.adjust>[1]

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

    switch (protocol) {
      case LendingProtocol.AaveV2:
        return await strategies.aave.v2.adjust(args, stratDeps)
      case LendingProtocol.AaveV3:
        return await strategies.aave.v3.adjust(args, stratDeps)
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

function getTokensInBaseUnit({
  manageTokenInput,
  currentPosition,
}: ManageAaveParameters): [BigNumber, BigNumber] {
  if (!manageTokenInput?.manageTokenAction) {
    return [zero, zero]
  }

  const collateralInBaseUnit =
    manageTokenInput?.manageTokenAction === ManageCollateralActionsEnum.WITHDRAW_COLLATERAL ||
    manageTokenInput.manageTokenAction === ManageCollateralActionsEnum.DEPOSIT_COLLATERAL
      ? amountToWei(
          manageTokenInput?.manageTokenActionValue || zero,
          currentPosition.collateral.symbol,
        )
      : zero

  const debtInBaseUnit =
    manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.BORROW_DEBT ||
    manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.PAYBACK_DEBT
      ? amountToWei(manageTokenInput?.manageTokenActionValue || zero, currentPosition.debt.symbol)
      : zero

  return [collateralInBaseUnit, debtInBaseUnit]
}

export async function getManageAaveParameters(
  parameters: ManageAaveParameters,
): Promise<IPositionTransition> {
  try {
    const {
      proxyAddress,
      userAddress,
      networkId,
      slippage,
      currentPosition,
      manageTokenInput,
      proxyType,
    } = parameters

    assertNetwork(networkId)

    const provider = getRpcProvider(networkId)

    const addresses = getTokenAddresses(networkId)

    const [collateral, debt] = getTokensInBaseUnit(parameters)

    switch (manageTokenInput?.manageTokenAction) {
      case ManageDebtActionsEnum.PAYBACK_DEBT:
      case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
        type types = Parameters<typeof strategies.aave.v2.paybackWithdraw>

        const paybackWithdrawStratArgs: types[0] = {
          slippage,
          debtToken: {
            symbol: currentPosition.debt.symbol as AAVETokens,
            precision: currentPosition.debt.precision,
          },
          collateralToken: {
            symbol: currentPosition.collateral.symbol as AAVETokens,
            precision: currentPosition.collateral.precision,
          },
          amountCollateralToWithdrawInBaseUnit: collateral,
          amountDebtToPaybackInBaseUnit: debt,
        }

        const paybackWithdrawStratDeps: types[1] = {
          addresses: addresses as AAVEStrategyAddresses,
          currentPosition,
          provider: provider,
          getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress),
          proxy: proxyAddress,
          user: userAddress,
          isDPMProxy: proxyType === ProxyType.DpmProxy,
        }

        return await strategies.aave.v2.paybackWithdraw(
          paybackWithdrawStratArgs,
          paybackWithdrawStratDeps,
        )
      case ManageDebtActionsEnum.BORROW_DEBT:
      case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
        const borrowDepositStratArgs: Parameters<typeof strategies.aave.v2.depositBorrow>[0] = {
          slippage,
        }
        if (manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.BORROW_DEBT) {
          borrowDepositStratArgs.borrowAmount = debt || ZERO
        }
        if (
          manageTokenInput?.manageTokenAction === ManageCollateralActionsEnum.DEPOSIT_COLLATERAL
        ) {
          borrowDepositStratArgs.entryToken = {
            amountInBaseUnit: collateral || ZERO,
            symbol: currentPosition.collateral.symbol as Exclude<AAVETokens, 'WSTETH'>,
            precision: currentPosition.collateral.precision,
          }
        }
        const borrowDepositStratDeps: Parameters<typeof strategies.aave.v2.depositBorrow>[1] = {
          addresses: addresses as AAVEStrategyAddresses,
          currentPosition,
          provider: provider,
          getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress),
          proxy: proxyAddress,
          user: userAddress,
          isDPMProxy: proxyType === ProxyType.DpmProxy,
        }
        return await strategies.aave.v2.depositBorrow(
          borrowDepositStratArgs,
          borrowDepositStratDeps,
        )
      default:
        throw Error('Not implemented')
    }
  } catch (e) {
    console.error(e)
    throw e
  }
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
}: CloseAaveParameters): Promise<IPositionTransition> {
  assertNetwork(networkId)

  const collateralToken = {
    symbol: currentPosition.collateral.symbol as AAVETokens,
    precision: currentPosition.collateral.precision,
  }

  const debtToken = {
    symbol: currentPosition.debt.symbol as AAVETokens,
    precision: currentPosition.debt.precision,
  }

  type closeParameters =
    | Parameters<typeof strategies.aave.v2.close>
    | Parameters<typeof strategies.aave.v3.close>
  const stratArgs: closeParameters[0] = {
    slippage,
    debtToken,
    collateralToken,
    collateralAmountLockedInProtocolInWei: currentPosition.collateral.amount.minus(1),
    shouldCloseToCollateral,
  }

  const stratDeps: closeParameters[1] = {
    addresses: getTokenAddresses(networkId) as AAVEStrategyAddresses,
    currentPosition,
    provider: getRpcProvider(networkId),
    getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      return strategies.aave.v2.close(stratArgs, stratDeps)
    case LendingProtocol.AaveV3:
      return strategies.aave.v3.close(stratArgs, stratDeps)
  }
}

export async function getOpenDepositBorrowParameters(
  args: OpenAaveDepositBorrowParameters,
): Promise<ISimplePositionTransition> {
  const {
    collateralToken,
    debtToken,
    slippage,
    collateralAmount,
    borrowAmount,
    proxyAddress,
    userAddress,
    proxyType,
    networkId,
  } = args

  assertNetwork(networkId)

  const libArgs = {
    slippage,
    collateralToken: {
      symbol: collateralToken,
      precision: getToken(collateralToken).precision,
    },
    debtToken: {
      symbol: debtToken,
      precision: getToken(debtToken).precision,
    },
    amountCollateralToDepositInBaseUnit: amountToWei(collateralAmount, collateralToken),
    amountDebtToBorrowInBaseUnit: amountToWei(borrowAmount, debtToken),
    positionType: 'Borrow' as const,
  }

  const deps = {
    addresses: getTokenAddresses(networkId),
    provider: getRpcProvider(networkId),
    getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    proxyAddress,
  }

  return await strategies.aave.v2.openDepositAndBorrowDebt(libArgs, deps)
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
): transition is IPositionTransition {
  return !!transition && (transition.simulation as ISimulatedTransition).swap !== undefined
}

export function transitionHasMinConfigurableRiskRatio(
  transition?: ISimplePositionTransition,
): transition is IPositionTransition {
  return (
    !!transition &&
    (transition.simulation as ISimulatedTransition).minConfigurableRiskRatio !== undefined
  )
}

// library works with a normalised precision of 18, and is sometimes exposed in the API.
export const NORMALISED_PRECISION = new BigNumber(18)
