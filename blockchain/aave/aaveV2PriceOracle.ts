import BigNumber from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { amountFromWei } from 'blockchain/utils'
import { AaveV2PriceOracle } from 'types/web3-v1-contracts'
export interface AaveV2AssetsPricesParameters {
  tokens: string[]
}

export const getAaveV2AssetsPrices: CallDef<AaveV2AssetsPricesParameters, BigNumber[]> = {
  call: (_, { contract, chainId }) =>
    contract<AaveV2PriceOracle>(getNetworkContracts(chainId).aaveV2PriceOracle).methods
      .getAssetsPrices,
  prepareArgs: ({ tokens }, { chainId }) => [
    tokens.map((token) => getNetworkContracts(chainId).tokens[token].address),
  ],
  postprocess: (tokenPrices) =>
    tokenPrices.map((tokenPriceInEth) => amountFromWei(new BigNumber(tokenPriceInEth), 'ETH')),
}

export const getAaveV2AssetPrice: CallDef<string, BigNumber[]> = {
  call: (_, { contract, chainId }) =>
    contract<AaveV2PriceOracle>(getNetworkContracts(chainId).aaveV2PriceOracle).methods
      .getAssetsPrices,
  prepareArgs: (token, { chainId }) => [getNetworkContracts(chainId).tokens[token].address],
  postprocess: (tokenPrices) =>
    tokenPrices.map((tokenPriceInEth) => amountFromWei(new BigNumber(tokenPriceInEth), 'ETH')),
}

export const getAaveV2OracleAssetPriceData: CallDef<{ token: string }, BigNumber> = {
  call: (args, { contract, chainId }) => {
    return contract<AaveV2PriceOracle>(getNetworkContracts(chainId).aaveV2PriceOracle).methods
      .getAssetPrice
  },
  prepareArgs: ({ token }, { chainId }) => {
    return [getNetworkContracts(chainId).tokens[token].address]
  },
  postprocess: (result) => {
    return amountFromWei(new BigNumber(result), 'ETH') // aave price oracle always price in eth wei units
  },
}
