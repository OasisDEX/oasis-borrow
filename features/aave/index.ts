import { ADDRESSES, IRiskRatio, IStrategy, strategies } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { ContextConnected } from '../../blockchain/network'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall } from '../../helpers/swap'
import { IBasePosition } from '@oasisdex/oasis-actions/lib/src/helpers/calculations/Position'

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  riskRatio: IRiskRatio,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<IStrategy> {
  const addresses = {
    DAI: context.tokens['DAI'].address,
    ETH: context.tokens['ETH'].address,
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['STETH'].address,
    chainlinkEthUsdPriceFeed: ADDRESSES.main.chainlinkEthUsdPriceFeed, // TODO: Add this to context.
    aaveProtocolDataProvider: context.aaveProtocolDataProvider.address,
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
      getSwapData: getOneInchCall(proxyAddress),
    },
  )
}

export async function getAdjustAaveParameters(
  context: ContextConnected,
  stEthValueLocked: BigNumber,
  riskRatio: IRiskRatio,
  slippage: BigNumber,
  proxyAddress: string,
  position: IBasePosition,
): Promise<IStrategy> {
  const addresses = {
    DAI: context.tokens['DAI'].address,
    ETH: context.tokens['ETH'].address,
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['STETH'].address,
    chainlinkEthUsdPriceFeed: ADDRESSES.main.chainlinkEthUsdPriceFeed, // TODO: Add this to context.
    aaveProtocolDataProvider: context.aaveProtocolDataProvider.address,
    aavePriceOracle: context.aavePriceOracle.address,
    aaveLendingPool: context.aaveLendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }

  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  return await strategies.aave.adjustStEth(
    {
      depositAmount: amountToWei(stEthValueLocked, 'ETH'),
      slippage: slippage,
      multiple: riskRatio.multiple,
    },
    {
      addresses,
      provider: provider,
      getSwapData: getOneInchCall(proxyAddress),
      dsProxy: proxyAddress,
      position,
    },
  )
}

export async function getCloseAaveParameters(
  context: ContextConnected,
  stEthValueLocked: BigNumber,
  slippage: BigNumber,
  proxyAddress: string,
  position: IBasePosition,
): Promise<IStrategy> {
  const addresses = {
    DAI: context.tokens['DAI'].address,
    ETH: context.tokens['ETH'].address,
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['STETH'].address,
    chainlinkEthUsdPriceFeed: ADDRESSES.main.chainlinkEthUsdPriceFeed, // TODO: Add this to context.
    aaveProtocolDataProvider: context.aaveProtocolDataProvider.address,
    aavePriceOracle: context.aavePriceOracle.address,
    aaveLendingPool: context.aaveLendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }

  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  console.log('Value locked: ', stEthValueLocked.toString())

  return await strategies.aave.closeStEth(
    {
      stEthAmountLockedInAave: amountToWei(stEthValueLocked, 'ETH'),
      slippage: slippage,
    },
    {
      addresses,
      provider: provider,
      getSwapData: getOneInchCall(proxyAddress),
      dsProxy: proxyAddress,
      position,
    },
  )
}
