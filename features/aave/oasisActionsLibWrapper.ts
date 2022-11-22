import {
  IPosition,
  IRiskRatio,
  IStrategy,
  OPERATION_NAMES,
  Position,
  strategies,
} from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { Context } from '../../blockchain/network'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall } from '../../helpers/swap'
import { zero } from '../../helpers/zero'

function getAddressesFromContext(context: Context) {
  return {
    DAI: context.tokens['DAI'].address,
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['STETH'].address,
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
  strategy: IStrategy
  operationName: string
}

export async function getOpenAaveParameters({
  context,
  amount,
  token,
  riskRatio,
  slippage,
  proxyAddress,
}: OpenAaveParameters): Promise<OasisActionResult> {
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const strategy = await strategies.aave.openStEth(
    {
      depositAmount: amountToWei(amount, token),
      slippage: slippage,
      multiple: riskRatio.multiple,
    },
    {
      addresses: getAddressesFromContext(context),
      provider: provider,
      dsProxy: proxyAddress,
      getSwapData: getOneInchCall(context.swapAddress),
    },
  )

  return {
    strategy,
    operationName: OPERATION_NAMES.aave.OPEN_POSITION,
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
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const transformedPosition = {
    debt: {
      amount: amountToWei(currentPosition.debt.amount, currentPosition.debt.denomination || token),
      denomination: currentPosition.debt.denomination || token,
    },
    collateral: {
      amount: amountToWei(
        currentPosition.collateral.amount,
        currentPosition.debt.denomination || token,
      ),
      denomination: currentPosition.debt.denomination || token,
    },
    category: currentPosition.category,
  }

  const strategy = await strategies.aave.adjustStEth(
    {
      depositAmount: amountToWei(amount, token),
      slippage: slippage,
      multiple: riskRatio.multiple,
    },
    {
      addresses: getAddressesFromContext(context),
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      dsProxy: proxyAddress,
      position: transformedPosition,
    },
  )

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
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const strategy = await strategies.aave.closeStEth(
    {
      stEthAmountLockedInAave: amountToWei(
        currentPosition.collateral.amount,
        currentPosition.collateral.denomination || 'STETH',
      ),
      slippage: slippage,
    },
    {
      addresses: getAddressesFromContext(context),
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      dsProxy: proxyAddress,
      position: currentPosition,
    },
  )
  return { strategy, operationName: OPERATION_NAMES.aave.CLOSE_POSITION }
}

export const EMPTY_POSITION = new Position({ amount: zero }, { amount: zero }, zero, {
  maxLoanToValue: zero,
  liquidationThreshold: zero,
  dustLimit: zero,
})
