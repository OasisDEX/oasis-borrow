import { AavePriceOracle } from 'types/web3-v1-contracts/aave-price-oracle'

import { CallDef } from './callsHelpers'

export interface AaveUserReserveDataParameters {
  token: string
  proxyAddress: string
}

export interface AaveAssetsPricesParameters {
  tokens: AaveUserReserveDataParameters['token'][]
}

export type AaveAssetsPricesReply = string[]

export const getAaveAssetsPrices: CallDef<AaveAssetsPricesParameters, AaveAssetsPricesReply> = {
  call: (_, { contract, aavePriceOracle }) =>
    contract<AavePriceOracle>(aavePriceOracle).methods.getAssetsPrices,
  prepareArgs: ({ tokens }, context) => [tokens.map((token) => context.tokens[token].address)],
}
