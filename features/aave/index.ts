/* eslint-disable @typescript-eslint/no-unused-vars */

import { ADDRESSES, IRiskRatio, strategies } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'
import { Awaited } from 'ts-essentials'

import { ContextConnected } from '../../blockchain/network'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall, oneInchCallMock } from '../../helpers/swap'
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
    ...mainnetAddresses,
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
      getSwapData: oneInchCallMock,
      dsProxy: proxyAddress,
      // getSwapData: getOneInchRealCall('0x7C8BaafA542c57fF9B2B90612bf8aB9E86e22C09'),
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
    ...mainnetAddresses,
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
      getSwapData: getOneInchCall('0xa779C1D17bC5230c07afdC51376CAC1cb3Dd5314'),
      dsProxy: proxyAddress,
      position,
    },
  )
}
