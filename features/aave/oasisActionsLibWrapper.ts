import {
  AAVETokens,
  IPosition,
  IPositionTransition,
  IRiskRatio,
  Position,
  strategies,
} from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { Context, ContextConnected } from '../../blockchain/network'
import { getToken } from '../../blockchain/tokensMetadata'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall } from '../../helpers/swap'
import { zero } from '../../helpers/zero'

function getAddressesFromContext(context: Context) {
  return {
    DAI: context.tokens['DAI'].address,
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['STETH'].address,
    USDC: context.tokens['USDC'].address,
    wBTC: context.tokens['WBTC'].address,
    chainlinkEthUsdPriceFeed: context.chainlinkPriceOracle['ETHUSD'].address,
    aaveProtocolDataProvider: context.aaveProtocolDataProvider.address,
    aavePriceOracle: context.aavePriceOracle.address,
    aaveLendingPool: context.aaveLendingPool.address,
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
}

export interface AdjustAaveParameters {
  context: Context
  currentPosition: IPosition
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  amount: BigNumber
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
}: OpenAaveParameters): Promise<IPositionTransition> {
  try {
    checkContext(context, 'open position')
    const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

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

    const stratArgs = {
      slippage,
      multiple: riskRatio.multiple,
      debtToken: _debtToken,
      collateralToken: _collateralToken,
      depositedByUser,
      positionArgs: {
        positionId: 0,
        positionType: 'Earn' as const,
        protocol: 'AAVE' as const,
      },
    }

    const stratDeps = {
      addresses: getAddressesFromContext(context),
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      proxy: proxyAddress,
      user: context.account,
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

    const stratArgs = {
      slippage,
      multiple: riskRatio.multiple,
      debtToken: debtToken,
      collateralToken: collateralToken,
    }

    const stratDeps = {
      addresses: getAddressesFromContext(context),
      currentPosition,
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      proxy: proxyAddress,
      user: context.account,
    }

    return strategies.aave.adjust(stratArgs, stratDeps)
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
}: CloseAaveParameters): Promise<IPositionTransition> {
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

  const stratArgs = {
    slippage,
    debtToken,
    collateralToken,
    collateralAmountLockedInProtocolInWei: currentPosition.collateral.amount,
  }

  const stratDeps = {
    addresses: getAddressesFromContext(context),
    currentPosition,
    provider: provider,
    getSwapData: getOneInchCall(context.swapAddress),
    proxy: proxyAddress,
    user: context.account,
  }

  return strategies.aave.close(stratArgs, stratDeps)
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
