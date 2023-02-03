import {
  AAVETokens,
  IPosition,
  IPositionTransition,
  IRiskRatio,
  ISimulatedTransition,
  Position,
  strategies,
  ZERO,
} from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ethNullAddress } from 'blockchain/config'
import { Context, ContextConnected } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { providers } from 'ethers'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'

import { ManageTokenInput } from './common/BaseAaveContext'
import { ProxyType } from './common/StrategyConfigTypes'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from './strategyConfig'
import {
  ISimplePositionTransition,
  PositionType,
} from '@oasisdex/oasis-actions/lib/src/strategies/types'

function getAddressesFromContext(context: Context) {
  return {
    DAI: context.tokens['DAI'].address,
    ETH: ethNullAddress,
    WETH: context.tokens['WETH'].address,
    STETH: context.tokens['STETH'].address,
    USDC: context.tokens['USDC'].address,
    WBTC: context.tokens['WBTC'].address,
    chainlinkEthUsdPriceFeed: context.chainlinkPriceOracle['ETHUSD'].address,
    aaveProtocolDataProvider: context.aaveV2ProtocolDataProvider.address,
    aavePriceOracle: context.aaveV2PriceOracle.address,
    aaveLendingPool: context.aaveV2LendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }
}

export interface OpenAaveParameters {
  context: Context
  amount: BigNumber
  collateralToken: string
  debtToken: string
  depositToken: string
  token?: string // required for transaction parameters machine - set as deposit token
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  proxyType: ProxyType
  positionType: 'Multiply' | 'Earn' | 'Borrow'
}

export interface GetOnChainPositionParams {
  context: Context
  collateralToken: string
  debtToken: string
  proxyAddress: string
}

export interface CloseAaveParameters {
  context: Context
  currentPosition: IPosition
  slippage: BigNumber
  proxyAddress: string
  token: string
  amount: BigNumber
  proxyType: ProxyType
}

export interface AdjustAaveParameters {
  context: Context
  currentPosition: IPosition
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  amount: BigNumber
  proxyType: ProxyType
}

export interface ManageAaveParameters {
  context: Context
  currentPosition: IPosition
  slippage: BigNumber
  proxyAddress: string
  manageTokenInput?: ManageTokenInput
  amount: BigNumber
  token?: string
  proxyType: ProxyType
}

function checkContext(context: Context, msg: string): asserts context is ContextConnected {
  if ((context as ContextConnected).account === undefined) {
    console.error('Context is not connected', context)
    throw new Error(`Could not build chain mutation params.  Context is not connected - ${msg}`)
  }
}

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

export async function getOpenAaveParameters({
  context,
  amount,
  collateralToken,
  debtToken,
  depositToken,
  riskRatio,
  slippage,
  proxyAddress,
  proxyType,
  positionType,
}: OpenAaveParameters): Promise<IPositionTransition> {
  try {
    const _collateralToken = {
      symbol: collateralToken as AAVETokens,
      precision: getToken(collateralToken).precision,
    }

    const _debtToken = {
      symbol: debtToken as AAVETokens,
      precision: getToken(debtToken).precision,
    }

    let depositedByUser: {
      collateralToken?: { amountInBaseUnit: BigNumber }
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
      throw new Error('Deposit token is not collateral or debt token')
    }

    const stratArgs: Parameters<typeof strategies.aave.open>[0] = {
      slippage,
      multiple: riskRatio.multiple,
      debtToken: _debtToken,
      collateralToken: _collateralToken,
      depositedByUser,
      positionType: positionType,
    }

    const stratDeps: Parameters<typeof strategies.aave.open>[1] = {
      addresses: getAddressesFromContext(context),
      provider: context.rpcProvider,
      getSwapData: getOneInchCall(context.swapAddress),
      proxy: proxyAddress,
      user: proxyAddress !== ethNullAddress ? context.account! : ethNullAddress, // mocking the address before wallet connection
      isDPMProxy: proxyType === ProxyType.DpmProxy,
    }

    return strategies.aave.open(stratArgs, stratDeps)
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function getOnChainPosition({
  context,
  proxyAddress,
  collateralToken,
  debtToken,
}: GetOnChainPositionParams): Promise<IPosition> {
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const _collateralToken = {
    symbol: collateralToken as AAVETokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as AAVETokens,
    precision: getToken(debtToken).precision,
  }

  return await strategies.aave.view(
    {
      proxy: proxyAddress,
      collateralToken: _collateralToken,
      debtToken: _debtToken,
    },
    { addresses: getAddressesFromContext(context), provider },
  )
}

export async function getAdjustAaveParameters({
  context,
  proxyAddress,
  slippage,
  riskRatio,
  currentPosition,
  proxyType,
}: AdjustAaveParameters): Promise<IPositionTransition> {
  try {
    checkContext(context, 'adjust position')

    const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

    const collateralToken = {
      symbol: currentPosition.collateral.symbol as AAVETokens,
      precision: currentPosition.collateral.precision,
    }

    const debtToken = {
      symbol: currentPosition.debt.symbol as AAVETokens,
      precision: currentPosition.debt.precision,
    }

    type adjustParameters = Parameters<typeof strategies.aave.adjust>

    const stratArgs: adjustParameters[0] = {
      slippage,
      multiple: riskRatio.multiple,
      debtToken: debtToken,
      collateralToken: collateralToken,
    }

    const stratDeps: adjustParameters[1] = {
      addresses: getAddressesFromContext(context),
      currentPosition,
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      proxy: proxyAddress,
      user: context.account,
      isDPMProxy: proxyType === ProxyType.DpmProxy,
    }

    return strategies.aave.adjust(stratArgs, stratDeps)
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
      context,
      proxyAddress,
      slippage,
      currentPosition,
      manageTokenInput,
      proxyType,
    } = parameters

    checkContext(context, 'deposit/borrow position')
    const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)
    const addresses = getAddressesFromContext(context)

    const [collateral, debt] = getTokensInBaseUnit(parameters)

    switch (manageTokenInput?.manageTokenAction) {
      case ManageDebtActionsEnum.PAYBACK_DEBT:
      case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
        type types = Parameters<typeof strategies.aave.paybackWithdraw>

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
          addresses,
          currentPosition,
          provider: provider,
          getSwapData: getOneInchCall(context.swapAddress),
          proxy: proxyAddress,
          user: context.account,
          isDPMProxy: proxyType === ProxyType.DpmProxy,
        }

        return await strategies.aave.paybackWithdraw(
          paybackWithdrawStratArgs,
          paybackWithdrawStratDeps,
        )
      case ManageDebtActionsEnum.BORROW_DEBT:
      case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
        const borrowDepositStratArgs: Parameters<typeof strategies.aave.depositBorrow>[0] = {
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
            symbol: currentPosition.collateral.symbol as AAVETokens,
            precision: currentPosition.collateral.precision,
          }
        }
        const borrowDepositStratDeps: Parameters<typeof strategies.aave.depositBorrow>[1] = {
          addresses,
          currentPosition,
          provider: provider,
          getSwapData: getOneInchCall(context.swapAddress),
          proxy: proxyAddress,
          user: context.account,
          isDPMProxy: proxyType === ProxyType.DpmProxy,
        }
        return await strategies.aave.depositBorrow(borrowDepositStratArgs, borrowDepositStratDeps)
      default:
        throw Error('Not implemented')
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function getCloseAaveParameters({
  context,
  proxyAddress,
  slippage,
  currentPosition,
  proxyType,
}: CloseAaveParameters): Promise<IPositionTransition> {
  checkContext(context, 'adjust position')

  const collateralToken = {
    symbol: currentPosition.collateral.symbol as AAVETokens,
    precision: currentPosition.collateral.precision,
  }

  const debtToken = {
    symbol: currentPosition.debt.symbol as AAVETokens,
    precision: currentPosition.debt.precision,
  }

  type closeParameters = Parameters<typeof strategies.aave.close>
  const stratArgs: closeParameters[0] = {
    slippage,
    debtToken,
    collateralToken,
    collateralAmountLockedInProtocolInWei: currentPosition.collateral.amount.minus(1),
  }

  const stratDeps: closeParameters[1] = {
    addresses: getAddressesFromContext(context),
    currentPosition,
    provider: context.rpcProvider,
    getSwapData: getOneInchCall(context.swapAddress),
    proxy: proxyAddress,
    user: context.account,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
  }

  return strategies.aave.close(stratArgs, stratDeps)
}

export type OpenDepositBorrowParameters = {
  context: Context
  collateralToken: AAVETokens
  debtToken: AAVETokens
  slippage: BigNumber
  collateralAmount: BigNumber
  borrowAmount: BigNumber
  proxyAddress: string
  proxyType: ProxyType
}

export async function getOpenDepositBorrowParameters(
  blah: OpenDepositBorrowParameters,
): Promise<ISimplePositionTransition> {
  const {
    context,
    collateralToken,
    debtToken,
    slippage,
    collateralAmount,
    borrowAmount,
    proxyAddress,
    proxyType,
  } = blah
  checkContext(context, 'getOpenDepositBorrowParameters')

  const args = {
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
    positionType: 'Borrow' as PositionType,
  }

  const deps = {
    addresses: getAddressesFromContext(context),
    provider: context.rpcProvider,
    getSwapData: getOneInchCall(context.swapAddress),
    proxy: proxyAddress,
    user: context.account,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    proxyAddress,
  }

  return await strategies.aave.openDepositAndBorrowDebt(args, deps)
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
