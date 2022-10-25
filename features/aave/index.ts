import { IPosition, IRiskRatio, IStrategy, Position, strategies } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'

import { ContextConnected } from '../../blockchain/network'
import { amountToWei } from '../../blockchain/utils'
import { getOneInchCall } from '../../helpers/swap'
import { zero } from '../../helpers/zero'
import { IBasePosition } from '@oasisdex/oasis-actions/lib/src/helpers/calculations/Position'

function getAddressesFromContext(context: ContextConnected) {
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

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  riskRatio: IRiskRatio,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<IStrategy> {
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const params = await strategies.aave.openStEth(
    {
      depositAmount: amountToWei(amount, 'ETH'),
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

  return params
}

export async function getAdjustAaveParameters(
  context: ContextConnected,
  stEthValueLocked: BigNumber | undefined,
  riskRatio: IRiskRatio,
  slippage: BigNumber,
  proxyAddress: string,
  position: IPosition,
): Promise<IStrategy> {
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const depositAmount = stEthValueLocked && amountToWei(stEthValueLocked, 'ETH')

  const transformedPosition: IBasePosition = {
    debt: { amount: amountToWei(position.debt.amount, 'ETH'), denomination: 'ETH' },
    collateral: { amount: amountToWei(position.collateral.amount, 'ETH'), denomination: 'ETH' },
    category: position.category,
  }

  const strat = await strategies.aave.adjustStEth(
    {
      depositAmount: depositAmount,
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

export const EMPTY_POSITION = new Position({ amount: zero }, { amount: zero }, zero, {
  maxLoanToValue: zero,
  liquidationThreshold: zero,
  dustLimit: zero,
})
