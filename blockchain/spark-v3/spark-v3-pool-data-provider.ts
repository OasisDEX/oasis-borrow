import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { amountFromRay, amountFromWei } from 'blockchain/utils'
import { warnIfAddressIsZero } from 'helpers/warnIfAddressIsZero'
import { SparkV3PoolDataProvider__factory } from 'types/ethers-contracts'

import type { BaseParameters } from './utils'
import { getNetworkMapping, wethToEthAddress } from './utils'

export interface SparkV3UserReserveDataParameters extends BaseParameters {
  token: string
  address: string
}

export interface SparkV3ReserveDataParameters extends BaseParameters {
  token: SparkV3UserReserveDataParameters['token']
}

export interface SparkV3UserReserveData {
  currentSpTokenBalance: BigNumber
  currentStableDebt: BigNumber
  currentVariableDebt: BigNumber
  principalStableDebt: BigNumber
  scaledVariableDebt: BigNumber
  stableBorrowRate: BigNumber
  liquidityRate: BigNumber
  usageAsCollateralEnabled: boolean
}

export interface SparkV3ReserveDataReply {
  availableLiquidity: BigNumber
  unbacked: BigNumber
  accruedToTreasuryScaled: BigNumber
  totalSpToken: BigNumber
  totalStableDebt: BigNumber
  totalVariableDebt: BigNumber
  liquidityRate: BigNumber
  variableBorrowRate: BigNumber
  stableBorrowRate: BigNumber
  averageStableBorrowRate: BigNumber
  liquidityIndex: BigNumber
  variableBorrowIndex: BigNumber
  lastUpdateTimestamp: BigNumber
}

export interface SparkV3ReserveConfigurationParameters extends BaseParameters {
  token: string
}

export interface SparkV3ReserveConfigurationData {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
  // .... could add more things here.  see https://etherscan.io/address/0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3#readContract
}

const networkMappings = {
  [NetworkIds.MAINNET]: () =>
    getNetworkMapping(
      SparkV3PoolDataProvider__factory,
      NetworkIds.MAINNET,
      'sparkV3PoolDataProvider',
    ),
}

export function getSparkV3UserReserveData({
  token,
  address,
  networkId,
}: SparkV3UserReserveDataParameters): Promise<SparkV3UserReserveData> {
  const { contract, tokenMappings } = networkMappings[networkId]()
  const tokenAddress = wethToEthAddress(tokenMappings, token)
  return contract.getUserReserveData(tokenAddress, address).then((result) => {
    return {
      currentSpTokenBalance: amountFromWei(
        new BigNumber(result.currentSpTokenBalance.toString()),
        token,
      ),
      currentStableDebt: amountFromWei(new BigNumber(result.currentStableDebt.toString()), token),
      currentVariableDebt: amountFromWei(
        new BigNumber(result.currentVariableDebt.toString()),
        token,
      ),
      principalStableDebt: amountFromWei(
        new BigNumber(result.principalStableDebt.toString()),
        token,
      ),
      scaledVariableDebt: amountFromWei(new BigNumber(result.scaledVariableDebt.toString()), token),
      stableBorrowRate: new BigNumber(result.stableBorrowRate.toString()),
      liquidityRate: new BigNumber(result.liquidityRate.toString()),
      usageAsCollateralEnabled: result.usageAsCollateralEnabled,
    }
  })
}

export function getSparkV3ReserveData({
  token,
  networkId,
}: SparkV3ReserveDataParameters): Promise<SparkV3ReserveDataReply> {
  const { contract, tokenMappings } = networkMappings[networkId]()
  const tokenAddress = wethToEthAddress(tokenMappings, token)
  warnIfAddressIsZero(tokenAddress, networkId, 'sparkV3PoolDataProvider', 'getReserveData')
  return contract.getReserveData(tokenAddress).then((result) => {
    const totalSpToken = amountFromWei(new BigNumber(result.totalSpToken.toString()), token)
    const totalStableDebt = amountFromWei(new BigNumber(result.totalStableDebt.toString()), token)
    const totalVariableDebt = amountFromWei(
      new BigNumber(result.totalVariableDebt.toString()),
      token,
    )
    return {
      availableLiquidity: totalSpToken.minus(totalStableDebt).minus(totalVariableDebt),
      unbacked: new BigNumber(result.unbacked.toString()),
      accruedToTreasuryScaled: new BigNumber(result.accruedToTreasuryScaled.toString()),
      liquidityRate: amountFromRay(new BigNumber(result.liquidityRate.toString())),
      variableBorrowRate: amountFromRay(new BigNumber(result.variableBorrowRate.toString())),
      stableBorrowRate: amountFromRay(new BigNumber(result.stableBorrowRate.toString())),
      averageStableBorrowRate: amountFromRay(
        new BigNumber(result.averageStableBorrowRate.toString()),
      ),
      liquidityIndex: new BigNumber(result.liquidityIndex.toString()),
      variableBorrowIndex: new BigNumber(result.variableBorrowIndex.toString()),
      lastUpdateTimestamp: new BigNumber(result.lastUpdateTimestamp.toString()),
      totalSpToken,
      totalStableDebt,
      totalVariableDebt,
    }
  })
}

export function getSparkV3ReserveConfigurationData({
  networkId,
  token,
}: SparkV3ReserveConfigurationParameters): Promise<SparkV3ReserveConfigurationData> {
  const { contract, tokenMappings } = networkMappings[networkId]()
  warnIfAddressIsZero(
    tokenMappings[token].address,
    networkId,
    'sparkV3PoolDataProvider',
    'getSparkV3ReserveConfigurationData',
  )
  const tokenAddress = wethToEthAddress(tokenMappings, token)
  return contract.getReserveConfigurationData(tokenAddress).then((result) => {
    return {
      ltv: new BigNumber(result.ltv.toString()).div(10000), // 6900 -> 0.69
      liquidationThreshold: new BigNumber(result.liquidationThreshold.toString()).div(10000), // 8100 -> 0.81
      liquidationBonus: new BigNumber(result.liquidationBonus.toString()).minus(10000).div(10000), // 10500 -> 1.05 -> 0.05
    }
  })
}

export interface SparkV3EModeForAssetParameters extends BaseParameters {
  token: string
}

export function getSparkV3EModeCategoryForAsset({
  token,
  networkId,
}: SparkV3EModeForAssetParameters): Promise<BigNumber> {
  const { contract, tokenMappings } = networkMappings[networkId]()
  const address = wethToEthAddress(tokenMappings, token)
  warnIfAddressIsZero(
    address,
    networkId,
    'sparkV3PoolDataProvider',
    'getSparkV3EModeCategoryForAsset',
  )
  return contract.getReserveEModeCategory(address).then((result) => {
    return new BigNumber(result.toString())
  })
}
