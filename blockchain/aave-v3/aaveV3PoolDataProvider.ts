import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { amountFromRay, amountFromWei } from 'blockchain/utils'
import { AaveV3PoolDataProvider__factory } from 'types/ethers-contracts'

import { BaseParameters, getNetworkMapping } from './utils'

export interface AaveV3UserReserveDataParameters extends BaseParameters {
  token: string
  address: string
}

export interface AaveV3ReserveDataParameters extends BaseParameters {
  token: AaveV3UserReserveDataParameters['token']
}

export interface AaveV3UserReserveData {
  currentATokenBalance: BigNumber
  currentStableDebt: BigNumber
  currentVariableDebt: BigNumber
  principalStableDebt: BigNumber
  scaledVariableDebt: BigNumber
  stableBorrowRate: BigNumber
  liquidityRate: BigNumber
  usageAsCollateralEnabled: boolean
}

export interface AaveV3ReserveDataReply {
  availableLiquidity: BigNumber
  unbacked: BigNumber
  accruedToTreasuryScaled: BigNumber
  totalAToken: BigNumber
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

export interface AaveV3ReserveConfigurationParameters extends BaseParameters {
  token: string
}

export interface AaveV3ReserveConfigurationData {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
  // .... could add more things here.  see https://etherscan.io/address/0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3#readContract
}

const networkMappings = {
  [NetworkIds.MAINNET]: getNetworkMapping(
    AaveV3PoolDataProvider__factory,
    NetworkIds.MAINNET,
    'aaveV3PoolDataProvider',
  ),
  [NetworkIds.OPTIMISMMAINNET]: getNetworkMapping(
    AaveV3PoolDataProvider__factory,
    NetworkIds.OPTIMISMMAINNET,
    'aaveV3PoolDataProvider',
  ),
  [NetworkIds.ARBITRUMMAINNET]: getNetworkMapping(
    AaveV3PoolDataProvider__factory,
    NetworkIds.ARBITRUMMAINNET,
    'aaveV3PoolDataProvider',
  ),
}

export function getAaveV3UserReserveData({
  token,
  address,
  networkId,
}: AaveV3UserReserveDataParameters): Promise<AaveV3UserReserveData> {
  const { contract, tokenMappings } = networkMappings[networkId]
  if (!networkMappings[networkId]) {
    console.warn('No getAaveV3UserReserveData network mapping for', networkId)
  }
  const tokenAddress = tokenMappings[token].address
  return contract.getUserReserveData(tokenAddress, address).then((result) => {
    return {
      currentATokenBalance: amountFromWei(
        new BigNumber(result.currentATokenBalance.toString()),
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

export function getAaveV3ReserveData({
  token,
  networkId,
}: AaveV3ReserveDataParameters): Promise<AaveV3ReserveDataReply> {
  const { contract, tokenMappings } = networkMappings[networkId]
  const tokenAddress = tokenMappings[token].address
  return contract.getReserveData(tokenAddress).then((result) => {
    const totalAToken = amountFromWei(new BigNumber(result.totalAToken.toString()), token)
    const totalStableDebt = amountFromWei(new BigNumber(result.totalStableDebt.toString()), token)
    const totalVariableDebt = amountFromWei(
      new BigNumber(result.totalVariableDebt.toString()),
      token,
    )
    return {
      availableLiquidity: totalAToken.minus(totalStableDebt).minus(totalVariableDebt),
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
      totalAToken,
      totalStableDebt,
      totalVariableDebt,
    }
  })
}

export function getAaveV3ReserveConfigurationData({
  networkId,
  token,
}: AaveV3ReserveConfigurationParameters): Promise<AaveV3ReserveConfigurationData> {
  const { contract, tokenMappings } = networkMappings[networkId]
  const tokenAddress = tokenMappings[token].address
  return contract.getReserveConfigurationData(tokenAddress).then((result) => {
    return {
      ltv: new BigNumber(result.ltv.toString()).div(10000), // 6900 -> 0.69
      liquidationThreshold: new BigNumber(result.liquidationThreshold.toString()).div(10000), // 8100 -> 0.81
      liquidationBonus: new BigNumber(result.liquidationBonus.toString()).div(10000), // 10500 -> 1.05
    }
  })
}

export interface AaveV3EModeForAssetParameters extends BaseParameters {
  token: string
}

export function getAaveV3EModeCategoryForAsset({
  token,
  networkId,
}: AaveV3EModeForAssetParameters): Promise<BigNumber> {
  const { contract, tokenMappings } = networkMappings[networkId]
  const address = tokenMappings[token].address
  return contract.getReserveEModeCategory(address).then((result) => {
    return new BigNumber(result.toString())
  })
}
