/* eslint-disable @typescript-eslint/no-unused-vars */

import { ADDRESSES, strategy } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { ContextConnected } from '../../blockchain/network'
import { oneInchCallMock } from '../../helpers/swap'

export interface ActionCall {
  targetHash: string
  callData: string
}

export interface PositionInfo {
  flashLoanAmount: BigNumber
  borrowedAmount: BigNumber
  fee: BigNumber
  depositedAmount: BigNumber
}

export interface OpenPositionResult {
  calls: ActionCall[]
  operationName: string
  positionInfo: PositionInfo
  isAllowanceNeeded: boolean
}

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  multiply: number,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<OpenPositionResult> {
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

  const strategyReturn = await strategy.openStEth(
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
