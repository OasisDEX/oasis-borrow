import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { AaveV3Pool__factory } from 'types/ethers-contracts'

import type { BaseParameters } from './utils'
import { getNetworkMapping } from './utils'

export interface AaveV3UserAccountData {
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

export interface AaveV3UserAccountDataParameters extends BaseParameters {
  address: string
}

export interface AaveV3UserConfigurationsParameters extends BaseParameters {
  address: string
}
export type AaveV3ConfigurationData = string[]

const networkMappings = {
  [NetworkIds.MAINNET]: () =>
    getNetworkMapping(AaveV3Pool__factory, NetworkIds.MAINNET, 'aaveV3Pool'),
  [NetworkIds.OPTIMISMMAINNET]: () =>
    getNetworkMapping(AaveV3Pool__factory, NetworkIds.OPTIMISMMAINNET, 'aaveV3Pool'),
  [NetworkIds.ARBITRUMMAINNET]: () =>
    getNetworkMapping(AaveV3Pool__factory, NetworkIds.ARBITRUMMAINNET, 'aaveV3Pool'),
  [NetworkIds.BASEMAINNET]: () =>
    getNetworkMapping(AaveV3Pool__factory, NetworkIds.BASEMAINNET, 'aaveV3Pool'),
}

export function getAaveV3UserAccountData({
  networkId,
  address,
}: AaveV3UserAccountDataParameters): Promise<AaveV3UserAccountData> {
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

export function getAaveV3UserConfigurations({
  networkId,
  address,
}: AaveV3UserConfigurationsParameters): Promise<AaveV3ConfigurationData> {
  const { contract } = networkMappings[networkId]()
  return contract.getUserConfiguration(address).then((result) => {
    return result.map((value) => value.toString())
  })
}

export function getAaveV3ReservesList({
  networkId,
}: BaseParameters): Promise<AaveV3ConfigurationData> {
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
