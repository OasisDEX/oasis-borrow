/* eslint-disable @typescript-eslint/no-unused-vars */

import { ADDRESSES, IRiskRatio, strategies } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'
import { Awaited } from 'ts-essentials'

import { ContextConnected } from '../../blockchain/network'
import { oneInchCallMock } from '../../helpers/swap'

export interface ActionCall {
  targetHash: string
  callData: string
}

export interface OperationParameters {
  operationName: string
  isAllowanceNeeded: boolean
  strategy: Awaited<ReturnType<typeof strategies.aave.openStEth>>
}

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  riskRatio: IRiskRatio,
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
    aaveProtocolDataProvider: ADDRESSES.main.aave.DataProvider,
  }

  const addresses = {
    ...mainnetAddresses,
  }

  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const strategyReturn = await strategies.aave.openStEth(
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
  return {
    strategy: strategyReturn,
    operationName: 'CustomOperation',
    isAllowanceNeeded: false,
  }
}
