import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { AavePriceOracle } from 'types/web3-v1-contracts/aave-price-oracle'

import { CallDefOverwriteReply } from './callsHelpers'
export interface AaveAssetsPricesParameters {
  tokens: string[]
}

export type AaveAssetsPricesReply = string[]
export type AaveAssetsPricesProcessedReply = BigNumber[]

export const getAaveAssetsPrices: CallDefOverwriteReply<
  AaveAssetsPricesParameters,
  AaveAssetsPricesReply,
  AaveAssetsPricesProcessedReply
> = {
  call: (_, { contract, aavePriceOracle }) =>
    contract<AavePriceOracle>(aavePriceOracle).methods.getAssetsPrices,
  prepareArgs: ({ tokens }, context) => [tokens.map((token) => context.tokens[token].address)],
  postprocess: (tokenPrices) =>
    tokenPrices.map((tokenPriceInEth) => amountFromWei(new BigNumber(tokenPriceInEth), 'ETH')),
}
