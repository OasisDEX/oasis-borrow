import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { AaveV3Oracle } from 'types/web3-v1-contracts/aave-v3-oracle'

import { CallDef } from '../calls/callsHelpers'
export interface AaveV3AssetsPricesParameters {
  tokens: string[]
}

export const getAaveV3AssetsPrices: CallDef<AaveV3AssetsPricesParameters, BigNumber[]> = {
  call: (_, { contract, aaveV3Oracle }) =>
    contract<AaveV3Oracle>(aaveV3Oracle).methods.getAssetsPrices,
  prepareArgs: ({ tokens }, context) => [tokens.map((token) => context.tokens[token].address)],
  postprocess: (tokenPrices) =>
    tokenPrices.map((tokenPriceInEth) => amountFromWei(new BigNumber(tokenPriceInEth), 'ETH')),
}

export const getAaveV3OracleAssetPriceData$: CallDef<{ token: string }, BigNumber> = {
  call: (args, { contract, aaveV3Oracle }) => {
    return contract<AaveV3Oracle>(aaveV3Oracle).methods.getAssetPrice
  },
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return amountFromWei(new BigNumber(result), 'ETH') // aave price oracle always price in base units
  },
}
