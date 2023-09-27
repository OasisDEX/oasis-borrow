import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { one } from 'helpers/zero'
import { SparkV3Oracle__factory } from 'types/ethers-contracts'

import type { BaseParameters } from './utils'
import { getNetworkMapping, wethToEthAddress } from './utils'

export interface SparkV3AssetsPricesParameters extends BaseParameters {
  tokens: string[]
}

export interface SparkV3OracleAssetPriceDataParameters extends BaseParameters {
  token: string
  amount?: BigNumber
}

const networkMappings = {
  [NetworkIds.MAINNET]: () =>
    getNetworkMapping(SparkV3Oracle__factory, NetworkIds.MAINNET, 'sparkV3Oracle'),
}

export function getSparkV3AssetsPrices({
  tokens,
  networkId,
}: SparkV3AssetsPricesParameters): Promise<BigNumber[]> {
  const { contract, tokenMappings, baseCurrencyUnit } = networkMappings[networkId]()
  const tokenAddresses = tokens.map((token) => wethToEthAddress(tokenMappings, token))
  return contract.getAssetsPrices(tokenAddresses).then((result) => {
    return result.map((tokenPriceInBaseCurrency) =>
      new BigNumber(tokenPriceInBaseCurrency.toString()).div(baseCurrencyUnit),
    )
  })
}

export function getSparkV3OracleAssetPrice({
  token,
  amount = one,
  networkId,
}: SparkV3OracleAssetPriceDataParameters) {
  const { contract, tokenMappings, baseCurrencyUnit } = networkMappings[networkId]()
  const tokenAddress = wethToEthAddress(tokenMappings, token)
  return contract.getAssetPrice(tokenAddress).then((result) => {
    return new BigNumber(result.toString()).times(amount).div(baseCurrencyUnit)
  })
}
