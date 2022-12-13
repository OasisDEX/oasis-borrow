import {
  IPosition,
  IRiskRatio,
  IStrategy,
  OPERATION_NAMES,
  Position,
  strategies,
} from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ethers, providers } from 'ethers'

import aaveOraclePriceABI from '../../blockchain/abi/aave-price-oracle.json'
import aaveProtocolDataProviderABI from '../../blockchain/abi/aave-protocol-data-provider.json'
import { Context } from '../../blockchain/network'
import { getToken } from '../../blockchain/tokensMetadata'
import { amountFromWei, amountToWei } from '../../blockchain/utils'
import { getOneInchCall } from '../../helpers/swap'
import { zero } from '../../helpers/zero'

function getAddressesFromContext(context: Context) {
  return {
    DAI: context.tokens['DAI'].address,
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    WETH: context.tokens['WETH'].address,
    stETH: context.tokens['STETH'].address,
    USDC: context.tokens['USDC'].address,
    wBTC: context.tokens['WBTC'].address,
    chainlinkEthUsdPriceFeed: context.chainlinkPriceOracle['ETHUSD'].address,
    aaveProtocolDataProvider: context.aaveProtocolDataProvider.address,
    aavePriceOracle: context.aavePriceOracle.address,
    aaveLendingPool: context.aaveLendingPool.address,
    operationExecutor: context.operationExecutor.address,
  }
}

export interface OpenAaveParameters {
  context: Context
  amount: BigNumber
  collateralToken: string
  debtToken: string
  depositToken: string
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  token: string
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
    operationName: OPERATION_NAMES.common.CUSTOM_OPERATION,
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
      position: currentPosition,
    },
  )

  return { strategy, operationName: OPERATION_NAMES.common.CUSTOM_OPERATION }
}

export async function getOnChainPosition({
  context,
  proxyAddress,
  collateralToken,
  debtToken,
}: any): Promise<IPosition> {
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)

  const addresses = getAddressesFromContext(context)

  const aaveProtocolDataProvider = new ethers.Contract(
    addresses.aaveProtocolDataProvider,
    aaveProtocolDataProviderABI,
    provider,
  )

  const aavePriceOracle = new ethers.Contract(
    addresses.aavePriceOracle,
    aaveOraclePriceABI,
    provider,
  )

  const debtTokenConfig = getToken(debtToken)
  const collateralTokenConfig = getToken(collateralToken)

  const [
    aaveDebtTokenPriceInEth,
    aaveCollateralTokenPriceInEth,
    userReserveDataForDebtToken,
    userReserveDataForCollateral,
    reserveDataForCollateral,
  ] = await Promise.all([
    aavePriceOracle
      .getAssetPrice(context.tokens[debtToken].address)
      .then((amount: ethers.BigNumberish) =>
        amountFromWei(new BigNumber(amount.toString()), debtTokenConfig.symbol),
      ),
    aavePriceOracle
      .getAssetPrice(context.tokens[collateralToken].address)
      .then((amount: ethers.BigNumberish) =>
        amountFromWei(new BigNumber(amount.toString()), collateralTokenConfig.symbol),
      ),
    aaveProtocolDataProvider.getUserReserveData(context.tokens[debtToken].address, proxyAddress),
    aaveProtocolDataProvider.getUserReserveData(
      context.tokens[collateralToken].address,
      proxyAddress,
    ),
    aaveProtocolDataProvider.getReserveConfigurationData(context.tokens[collateralToken].address),
  ])

  const BASE = new BigNumber(10000)
  const liquidationThreshold = new BigNumber(
    reserveDataForCollateral.liquidationThreshold.toString(),
  ).div(BASE)
  const maxLoanToValue = new BigNumber(reserveDataForCollateral.ltv.toString()).div(BASE)

  const oracle = aaveCollateralTokenPriceInEth.div(aaveDebtTokenPriceInEth)

  return new Position(
    {
      amount: new BigNumber(userReserveDataForDebtToken.currentVariableDebt.toString()),
      denomination: debtTokenConfig.symbol,
    },
    {
      amount: new BigNumber(userReserveDataForCollateral.currentATokenBalance.toString()),
      denomination: collateralToken.symbol,
    },
    oracle,
    {
      dustLimit: new BigNumber(0),
      maxLoanToValue: maxLoanToValue,
      liquidationThreshold: liquidationThreshold,
    },
  )
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
      stEthAmountLockedInAave: currentPosition.collateral.amount,
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
