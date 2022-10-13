import { ADDRESSES, IRiskRatio, IStrategy, strategies } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { ContextConnected } from '../../blockchain/network'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall } from '../../helpers/swap'
import { IBasePosition } from '@oasisdex/oasis-actions/lib/src/helpers/calculations/Position'

function getAddressesFromContext(context: ContextConnected) {
  return {
    DAI: context.tokens['DAI'].address,
    ETH: context.tokens['ETH'].address,
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['STETH'].address,
    chainlinkEthUsdPriceFeed: context.chainlinkEthUsdPriceFeedAddress,
    aaveProtocolDataProvider: context.aaveProtocolDataProvider.address,
    aavePriceOracle: context.aavePriceOracle.address,
    aaveLendingPool: context.aaveLendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }
}

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  riskRatio: IRiskRatio,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<IStrategy> {
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  return await strategies.aave.openStEth(
    {
      depositAmount: amountToWei(amount, 'ETH'),
      slippage: slippage,
      multiple: riskRatio.multiple,
    },
    {
      addresses: getAddressesFromContext(context),
      provider: provider,
      // getSwapData: oneInchCallMock,
      dsProxy: proxyAddress,
      getSwapData: getOneInchCall(context.swapAddress),
    },
  )
}

export async function getAdjustAaveParameters(
  context: ContextConnected,
  stEthValueLocked: BigNumber | undefined,
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

  const strat = await strategies.aave.adjustStEth(
    {
      depositAmount: stEthValueLocked && amountToWei(stEthValueLocked, 'ETH'),
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

  return strat
}

export async function getCloseAaveParameters(
  context: ContextConnected,
  stEthValueLocked: BigNumber,
  slippage: BigNumber,
  proxyAddress: string,
  position: IBasePosition,
): Promise<IStrategy> {
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  return await strategies.aave.closeStEth(
    {
      stEthAmountLockedInAave: amountToWei(stEthValueLocked, 'STETH'),
      slippage: slippage,
    },
    {
      addresses: getAddressesFromContext(context),
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      dsProxy: proxyAddress,
      position,
    },
  )
}
