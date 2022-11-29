import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { AavePriceOracle } from 'types/web3-v1-contracts/aave-price-oracle'

import { CallDef } from '../callsHelpers'
export interface AaveAssetsPricesParameters {
  tokens: string[]
}

export const getAaveAssetsPrices: CallDef<AaveAssetsPricesParameters, BigNumber[]> = {
  call: (_, { contract, aavePriceOracle }) =>
    contract<AavePriceOracle>(aavePriceOracle).methods.getAssetsPrices,
  prepareArgs: ({ tokens }, context) => [tokens.map((token) => context.tokens[token].address)],
  postprocess: (tokenPrices) =>
    tokenPrices.map((tokenPriceInEth) => amountFromWei(new BigNumber(tokenPriceInEth), 'ETH')),
}

export const getAaveOracleAssetPriceData: CallDef<{ token: string }, BigNumber> = {
  call: (args, { contract, aavePriceOracle }) => {
    return contract<AavePriceOracle>(aavePriceOracle).methods.getAssetPrice
  },
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return amountFromWei(new BigNumber(result), 'ETH') // aave price oracle always price in eth wei units
  },
}
