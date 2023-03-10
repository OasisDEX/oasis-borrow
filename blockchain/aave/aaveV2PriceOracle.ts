import BigNumber from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { amountFromWei } from 'blockchain/utils'
import { AaveV2PriceOracle } from 'types/web3-v1-contracts/aave-v2-price-oracle'
export interface AaveV2AssetsPricesParameters {
  tokens: string[]
}

export const getAaveV2AssetsPrices: CallDef<AaveV2AssetsPricesParameters, BigNumber[]> = {
  call: (_, { contract, aaveV2PriceOracle }) =>
    contract<AaveV2PriceOracle>(aaveV2PriceOracle).methods.getAssetsPrices,
  prepareArgs: ({ tokens }, context) => [tokens.map((token) => context.tokens[token].address)],
  postprocess: (tokenPrices) =>
    tokenPrices.map((tokenPriceInEth) => amountFromWei(new BigNumber(tokenPriceInEth), 'ETH')),
}

export const getAaveV2OracleAssetPriceData: CallDef<{ token: string }, BigNumber> = {
  call: (args, { contract, aaveV2PriceOracle }) => {
    return contract<AaveV2PriceOracle>(aaveV2PriceOracle).methods.getAssetPrice
  },
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return amountFromWei(new BigNumber(result), 'ETH') // aave price oracle always price in eth wei units
  },
}
