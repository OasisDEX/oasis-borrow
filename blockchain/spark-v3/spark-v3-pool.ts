import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { SparkV3Pool__factory } from 'types/ethers-contracts'

import type { BaseParameters } from './utils'
import { getNetworkMapping } from './utils'

export interface SparkV3UserAccountData {
  totalCollateralBase: BigNumber
  totalDebtBase: BigNumber
  availableBorrowsBase: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
}

export interface GetEModeCategoryDataParameters extends BaseParameters {
  categoryId: BigNumber
}

export interface GetEModeCategoryDataResult {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
}

export interface SparkV3UserAccountDataParameters extends BaseParameters {
  address: string
}

export interface SparkV3UserConfigurationsParameters extends BaseParameters {
  address: string
}
export type SparkV3ConfigurationData = string[]

const networkMappings = {
  [NetworkIds.MAINNET]: () =>
    getNetworkMapping(SparkV3Pool__factory, NetworkIds.MAINNET, 'sparkV3Pool'),
}

export function getSparkV3UserAccountData({
  networkId,
  address,
}: SparkV3UserAccountDataParameters): Promise<SparkV3UserAccountData> {
  const { contract, baseCurrencyUnit } = networkMappings[networkId]()
  return contract.getUserAccountData(address).then((result) => {
    return {
      totalCollateralBase: new BigNumber(result.totalCollateralBase.toString()).div(
        baseCurrencyUnit,
      ),
      totalDebtBase: new BigNumber(result.totalDebtBase.toString()).div(baseCurrencyUnit),
      availableBorrowsBase: new BigNumber(result.availableBorrowsBase.toString()).div(
        baseCurrencyUnit,
      ),
      currentLiquidationThreshold: new BigNumber(result.currentLiquidationThreshold.toString()),
      ltv: new BigNumber(result.ltv.toString()),
      healthFactor: new BigNumber(result.healthFactor.toString()),
    }
  })
}

export function getSparkV3UserConfigurations({
  networkId,
  address,
}: SparkV3UserConfigurationsParameters): Promise<SparkV3ConfigurationData> {
  const { contract } = networkMappings[networkId]()
  return contract.getUserConfiguration(address).then((result) => {
    return result.map((value) => value.toString())
  })
}

export function getSparkV3ReservesList({
  networkId,
}: BaseParameters): Promise<SparkV3ConfigurationData> {
  const { contract } = networkMappings[networkId]()
  return contract.getReservesList().then((result) => {
    return result.map((value) => value.toString())
  })
}

export function getEModeCategoryData({
  networkId,
  categoryId,
}: GetEModeCategoryDataParameters): Promise<GetEModeCategoryDataResult> {
  const { contract } = networkMappings[networkId]()
  return contract.getEModeCategoryData(categoryId.toString(16)).then((result) => {
    return {
      ltv: new BigNumber(result.ltv.toString()).div(10000),
      liquidationThreshold: new BigNumber(result.liquidationThreshold.toString()).div(10000),
      liquidationBonus: new BigNumber(result.liquidationBonus.toString()).minus(10000).div(10000), // 10100 -> 100 -> -> 0.01
    }
  })
}
