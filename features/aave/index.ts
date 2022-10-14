import {
  ADDRESSES,
  IPosition,
  IRiskRatio,
  IStrategy,
  Position,
  strategies,
} from '@oasisdex/oasis-actions'
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

export function logPosition(position: IPosition, name: string) {
  console.log(`----------- ${name} ------------`)
  console.log(`collateral: ${position.collateral.amount}`)
  console.log(`debt: ${position.debt.amount}`)
  console.log(`ltv: ${position.riskRatio.loanToValue}`)
}

export async function getOpenAaveParameters(
  context: ContextConnected,
  amount: BigNumber,
  riskRatio: IRiskRatio,
  slippage: BigNumber,
  proxyAddress: string,
): Promise<IStrategy> {
  // console.log(`configured ltv: ${riskRatio.loanToValue}`)

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

  logPosition(params.simulation.position, 'new position in getOpenAaveParameters')

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
  logPosition(position, 'getAdjustAaveParameters - starting position')

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

  const depositAmount = stEthValueLocked && amountToWei(stEthValueLocked, 'ETH')

  const transformedPosition: IBasePosition = {
    debt: { amount: amountToWei(position.debt.amount, 'ETH'), denomination: 'ETH' },
    collateral: { amount: amountToWei(position.collateral.amount, 'ETH'), denomination: 'ETH' },
    category: position.category,
  }

  console.log(' -- params -- ')
  console.log(`depositAmount ${depositAmount}`)
  console.log(`slippage ${slippage}`)
  console.log(`multiple ${riskRatio.multiple} (ltv ${riskRatio.loanToValue})`)

  console.log(' ----- transformed position (inputting) ------')
  console.log(`collateral: ${transformedPosition.collateral.amount}`)
  console.log(`debt: ${transformedPosition.debt.amount}`)
  console.log(`liquidationThreshold: ${transformedPosition.category.liquidationThreshold}`)
  console.log(`maxLoanToValue: ${transformedPosition.category.maxLoanToValue}`)
  console.log(`dustLimit: ${transformedPosition.category.dustLimit}`)

  const strat = await strategies.aave.adjustStEth(
    {
      depositAmount: depositAmount,
      slippage: slippage,
      multiple: riskRatio.multiple,
    },
    {
      addresses,
      provider: provider,
      getSwapData: getOneInchCall(proxyAddress),
      dsProxy: proxyAddress,
      position: transformedPosition,
    },
  )

  logPosition(strat.simulation.position, 'getAdjustAaveParameters - target position from lib')

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
