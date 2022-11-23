import {
  IPosition,
  IRiskRatio,
  IPositionTransition,
  OPERATION_NAMES,
  Position,
  strategies,
} from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { Context, ContextConnected } from '../../blockchain/network'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall } from '../../helpers/swap'
import { zero } from '../../helpers/zero'
import { Swap } from '../../types/web3-v1-contracts/aave-lending-pool'

function getAddressesFromContext(context: Context) {
  return {
    DAI: context.tokens['DAI'].address,
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['STETH'].address,
    USDC: context.tokens['USDC'].address,
    wBTC: context.tokens['WBTC'].address,
    chainlinkEthUsdPriceFeed: context.chainlinkEthUsdPriceFeedAddress,
    aaveProtocolDataProvider: context.aaveProtocolDataProvider.address,
    aavePriceOracle: context.aavePriceOracle.address,
    aaveLendingPool: context.aaveLendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }
}

export interface OpenAaveParameters {
  context: Context
  amount: BigNumber
  token: string
  riskRatio: IRiskRatio
  slippage: BigNumber
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
  token: string
  amount: BigNumber
}

export interface OasisActionResult {
  strategy: IPositionTransition
  operationName: string
}

type AAVETokens = 'ETH' | 'WETH' | 'STETH' | 'WBTC' | 'USDC'

function checkContext(context: Context, msg: string): asserts context is ContextConnected {
  if ((context as ContextConnected).account === undefined) {
    console.error('Context is not connected', context)
    throw new Error(`Could not build chain mutation params.  Context is not connected - ${msg}`)
  }
}

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
  token,
  riskRatio,
  slippage,
  proxyAddress,
}: OpenAaveParameters): Promise<OasisActionResult> {
  try {
    checkContext(context, 'open position')

    const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

    const collateralToken = {
      symbol: 'STETH' as AAVETokens,
      precision: 18,
    }

    const debtToken = {
      symbol: token as AAVETokens,
      precision: 18,
    }

    const currentPosition = await strategies.aave.view(
      {
        proxy: proxyAddress,
        collateralToken,
        debtToken,
      },
      { addresses: getAddressesFromContext(context), provider: provider },
    )

    const stratArgs = {
      slippage,
      multiple: riskRatio.multiple,
      debtToken,
      collateralToken,
      depositedByUser: {
        debtInWei: amountToWei(amount, token),
      },
    }

    const stratDeps = {
      addresses: getAddressesFromContext(context),
      currentPosition,
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      proxy: proxyAddress,
      user: context.account,
    }

    const strategy = await strategies.aave.open(stratArgs, stratDeps)

    return {
      strategy,
      operationName: OPERATION_NAMES.aave.OPEN_POSITION,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function getAdjustAaveParameters({
  context,
  proxyAddress,
  slippage,
  amount,
  token,
  riskRatio,
  currentPosition,
}: AdjustAaveParameters): Promise<OasisActionResult> {
  checkContext(context, 'adjust position')

  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const collateralToken = {
    symbol: 'STETH' as AAVETokens,
    precision: 18,
  }

  const debtToken = {
    symbol: token as AAVETokens,
    precision: 18,
  }

  // const transformedPosition = {
  //   debt: {
  //     amount: amountToWei(currentPosition.debt.amount, currentPosition.debt.denomination || token),
  //     denomination: currentPosition.debt.denomination || token,
  //   },
  //   collateral: {
  //     amount: amountToWei(
  //       currentPosition.collateral.amount,
  //       currentPosition.debt.denomination || token,
  //     ),
  //     denomination: currentPosition.debt.denomination || token,
  //   },
  //   category: currentPosition.category,
  // }

  const strategy = await strategies.aave.adjust(
    {
      slippage,
      multiple: riskRatio.multiple,
      debtToken,
      collateralToken,
      depositedByUser: {
        debtInWei: amountToWei(amount, token),
      },
    },
    {
      addresses: getAddressesFromContext(context),
      currentPosition,
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      proxy: proxyAddress,
      user: context.account,
    },
  )

  // const strategy = await strategies.aave.adjustStEth(
  //   {
  //     depositAmount: amountToWei(amount, token),
  //     slippage: slippage,
  //     multiple: riskRatio.multiple,
  //   },
  //   {
  //     addresses: getAddressesFromContext(context),
  //     provider: provider,
  //     getSwapData: getOneInchCall(context.swapAddress),
  //     dsProxy: proxyAddress,
  //     position: transformedPosition,
  //   },
  // )

  // const operationName = riskRatio.loanToValue.gt(currentPosition.riskRatio.loanToValue)
  //   ? OPERATION_NAMES.common.CUSTOM_OPERATION
  //   : OPERATION_NAMES.common.CUSTOM_OPERATION

  return { strategy, operationName: OPERATION_NAMES.common.CUSTOM_OPERATION }
}

export async function getCloseAaveParameters({
  context,
  proxyAddress,
  slippage,
  currentPosition,
}: CloseAaveParameters): Promise<OasisActionResult> {
  checkContext(context, 'adjust position')

  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const collateralToken = {
    symbol: 'STETH' as AAVETokens,
    precision: 18,
  }

  const debtToken = {
    symbol: 'ETH' as AAVETokens,
    precision: 18,
  }

  const strategy = await strategies.aave.close(
    {
      slippage,
      debtToken,
      collateralToken,
      collateralAmountLockedInProtocolInWei: currentPosition.collateral.amount,
    },
    {
      addresses: getAddressesFromContext(context),
      currentPosition,
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      proxy: proxyAddress,
      user: context.account,
    },
  )

  // const strategy = await strategies.aave.closeStEth(
  //   {
  //     stEthAmountLockedInAave: amountToWei(
  //       currentPosition.collateral.amount,
  //       currentPosition.collateral.denomination || 'STETH',
  //     ),
  //     slippage: slippage,
  //   },
  //   {
  //     addresses: getAddressesFromContext(context),
  //     provider: provider,
  //     getSwapData: getOneInchCall(context.swapAddress),
  //     dsProxy: proxyAddress,
  //     position: currentPosition,
  //   },
  // )
  return { strategy, operationName: OPERATION_NAMES.aave.CLOSE_POSITION }
}

export const EMPTY_POSITION = new Position({ amount: zero }, { amount: zero }, zero, {
  maxLoanToValue: zero,
  liquidationThreshold: zero,
  dustLimit: zero,
})
