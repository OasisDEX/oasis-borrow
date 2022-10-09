/* eslint-disable @typescript-eslint/no-unused-vars */

import { ADDRESSES, IRiskRatio, strategies } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'
import { Awaited } from 'ts-essentials'

import { ContextConnected } from '../../blockchain/network'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall } from '../../helpers/swap'
import { IBasePosition } from '@oasisdex/oasis-actions/lib/src/helpers/calculations/Position'

export interface ActionCall {
  targetHash: string
  callData: string
}

export type OpenStEthReturn = Awaited<ReturnType<typeof strategies.aave.openStEth>>

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  riskRatio: IRiskRatio,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<OpenStEthReturn> {
  const mainnetAddresses = {
    DAI: ADDRESSES.main.DAI,
    ETH: ADDRESSES.main.ETH,
    WETH: ADDRESSES.main.WETH,
    stETH: ADDRESSES.main.stETH,
    chainlinkEthUsdPriceFeed: ADDRESSES.main.chainlinkEthUsdPriceFeed,
    aavePriceOracle: ADDRESSES.main.aavePriceOracle,
    aaveLendingPool: ADDRESSES.main.aave.MainnetLendingPool,
    operationExecutor: context.operationExecutor.address,
    aaveProtocolDataProvider: ADDRESSES.main.aave.DataProvider,
  }

  const addresses = {
    DAI: context.tokens['DAI'].address,
    ETH: context.tokens['ETH'].address,
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['stETH'].address,
    chainlinkEthUsdPriceFeed: context.aavePriceOracle.address,
    aavePriceOracle: context.aavePriceOracle.address,
    aaveLendingPool: context.aaveLendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }

  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  return await strategies.aave.openStEth(
    {
      depositAmount: amount,
      slippage: slippage,
      multiple: riskRatio.multiple,
    },
    {
      addresses,
      provider: provider,
      // getSwapData: oneInchCallMock,
      dsProxy: proxyAddress,
      getSwapData: getOneInchCall(context.swapAddress),
    },
  )
}

export type AdjustStEthReturn = Awaited<ReturnType<typeof strategies.aave.adjustStEth>>

export type CloseStEthReturn = Awaited<ReturnType<typeof strategies.aave.closeStEth>>

export async function getCloseAaveParameters(
  context: ContextConnected,
  stEthValueLocked: BigNumber,
  slippage: BigNumber,
  proxyAddress: string,
  position: IBasePosition,
): Promise<CloseStEthReturn> {
  const mainnetAddresses = {
    DAI: ADDRESSES.main.DAI,
    ETH: ADDRESSES.main.ETH,
    WETH: ADDRESSES.main.WETH,
    stETH: ADDRESSES.main.stETH,
    chainlinkEthUsdPriceFeed: ADDRESSES.main.chainlinkEthUsdPriceFeed,
    aavePriceOracle: ADDRESSES.main.aavePriceOracle,
    aaveLendingPool: ADDRESSES.main.aave.MainnetLendingPool,
    operationExecutor: context.operationExecutor.address,
  }

  const addresses = {
    DAI: context.tokens['DAI'].address,
    ETH: context.tokens['ETH'].address,
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['stETH'].address,
    chainlinkEthUsdPriceFeed: context.aavePriceOracle.address,
    aavePriceOracle: context.aavePriceOracle.address,
    aaveLendingPool: context.aaveLendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }

  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  return await strategies.aave.closeStEth(
    {
      stEthAmountLockedInAave: amountToWei(stEthValueLocked, 'ETH'),
      slippage: slippage,
    },
    {
      addresses,
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      dsProxy: proxyAddress,
      position,
    },
  )
}
