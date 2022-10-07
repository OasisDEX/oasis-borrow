/* eslint-disable @typescript-eslint/no-unused-vars */

import { ADDRESSES, strategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { ContextConnected } from '../../blockchain/network'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall, oneInchCallMock } from '../../helpers/swap'

export interface ActionCall {
  targetHash: string
  callData: string
}

export type PositionInfo = { fee: BigNumber } & Record<string, BigNumber>

export interface OperationParameters {
  calls: ActionCall[]
  // TODO: Is needed? The library should return it.
  operationName: string
  positionInfo: PositionInfo
  isAllowanceNeeded: boolean
}

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  multiply: BigNumber,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<OperationParameters> {
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

  const strategyReturn = await strategy.aave.openStEth(
    {
      depositAmount: amount,
      slippage: slippage,
      multiply: new BigNumber(multiply),
    },
    {
      addresses,
      provider: provider,
      getSwapData: oneInchCallMock,
      dsProxy: proxyAddress,
      // getSwapData: getOneInchRealCall('0x7C8BaafA542c57fF9B2B90612bf8aB9E86e22C09'),
    },
  )

  return {
    calls: strategyReturn.calls,
    operationName: 'CustomOperation',
    positionInfo: {
      flashLoanAmount: strategyReturn.flashLoanAmount,
      borrowedAmount: strategyReturn.borrowEthAmount,
      fee: strategyReturn.feeAmount,
      depositedAmount: amount,
    },
    isAllowanceNeeded: false,
  }
}

export async function getCloseAaveParameters(
  context: ContextConnected,
  stEthValueLocked: BigNumber,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<OperationParameters> {
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

  const strategyReturn = await strategy.aave.closeStEth(
    {
      stEthAmountLockedInAave: amountToWei(stEthValueLocked, 'ETH'),
      slippage: slippage,
    },
    {
      addresses,
      provider: provider,
      getSwapData: getOneInchCall('0xa779C1D17bC5230c07afdC51376CAC1cb3Dd5314'),
      dsProxy: proxyAddress,
    },
  )

  return {
    calls: strategyReturn.calls,
    operationName: 'CustomOperation',
    positionInfo: {
      fee: strategyReturn.feeAmount,
      ethAmountAfterSwap: strategyReturn.ethAmountAfterSwap,
    },
    isAllowanceNeeded: false,
  }
}
