import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networkIds'
import { one } from 'helpers/zero'
import { AaveV3Oracle__factory } from 'types/ethers-contracts/'

import { BaseParameters, getNetworkMapping } from './utils'

export interface AaveV3AssetsPricesParameters extends BaseParameters {
  tokens: string[]
}

export interface AaveV3OracleAssetPriceDataParameters extends BaseParameters {
  token: string
  amount?: BigNumber
}

const networkMappings = {
  [NetworkIds.MAINNET]: getNetworkMapping(AaveV3Oracle__factory, NetworkIds.MAINNET),
  [NetworkIds.HARDHAT]: getNetworkMapping(AaveV3Oracle__factory, NetworkIds.HARDHAT),
}

export function getAaveV3AssetsPrices({
  tokens,
  networkId,
}: AaveV3AssetsPricesParameters): Promise<BigNumber[]> {
  const { contract, tokenMappings, baseCurrencyUnit } = networkMappings[networkId]
  const tokenAddresses = tokens.map((token) => tokenMappings[token].address)
  return contract.getAssetsPrices(tokenAddresses).then((result) => {
    return result.map((tokenPriceInBaseCurrency) =>
      new BigNumber(tokenPriceInBaseCurrency.toString()).div(baseCurrencyUnit),
    )
  })
}

export function getAaveV3OracleAssetPrice({
  token,
  amount = one,
  networkId,
}: AaveV3OracleAssetPriceDataParameters) {
  const { contract, tokenMappings, baseCurrencyUnit } = networkMappings[networkId]
  const tokenAddress = tokenMappings[token].address
  return contract.getAssetPrice(tokenAddress).then((result) => {
    return new BigNumber(result.toString()).times(amount).div(baseCurrencyUnit)
  })
}
