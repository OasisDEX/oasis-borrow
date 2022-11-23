import BigNumber from 'bignumber.js'
import { ChainlinkPriceOracle } from 'types/web3-v1-contracts/chainlink-price-oracle'

import { CallDef } from '../callsHelpers'
export interface AaveAssetsPricesParameters {
  tokens: string[]
}

export const getChainlinkUSDCUSDPrice: CallDef<void, BigNumber> = {
  call: (_, { contract, chainlinkUsdcUsdPriceOracle }) =>
    contract<ChainlinkPriceOracle>(chainlinkUsdcUsdPriceOracle).methods.latestAnswer,
  prepareArgs: () => [],
  postprocess: (answer) => {
    return new BigNumber(answer).div(new BigNumber(10).pow(8))
  },
}
