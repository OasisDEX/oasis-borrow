import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { one } from 'helpers/zero'
import { AaveV3Oracle__factory } from 'types/ethers-contracts/'

import type { BaseParameters } from './utils'
import { getNetworkMapping, wethToEthAddress } from './utils'

export interface AaveV3AssetsPricesParameters extends BaseParameters {
  tokens: string[]
}

export interface AaveV3OracleAssetPriceDataParameters extends BaseParameters {
  token: string
  amount?: BigNumber
}

const networkMappings = {
  [NetworkIds.MAINNET]: () =>
    getNetworkMapping(AaveV3Oracle__factory, NetworkIds.MAINNET, 'aaveV3Oracle'),
  [NetworkIds.OPTIMISMMAINNET]: () =>
    getNetworkMapping(AaveV3Oracle__factory, NetworkIds.OPTIMISMMAINNET, 'aaveV3Oracle'),
  [NetworkIds.ARBITRUMMAINNET]: () =>
    getNetworkMapping(AaveV3Oracle__factory, NetworkIds.ARBITRUMMAINNET, 'aaveV3Oracle'),
}
export function getAaveV3AssetsPrices({
  tokens,
  networkId,
}: AaveV3AssetsPricesParameters): Promise<BigNumber[]> {
  const { contract, tokenMappings, baseCurrencyUnit } = networkMappings[networkId]()
  const tokenAddresses = tokens.map((token) => wethToEthAddress(tokenMappings, token))
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
  const { contract, tokenMappings, baseCurrencyUnit } = networkMappings[networkId]()
  const tokenAddress = wethToEthAddress(tokenMappings, token)
  return contract.getAssetPrice(tokenAddress).then((result) => {
    return new BigNumber(result.toString()).times(amount).div(baseCurrencyUnit)
  })
}
