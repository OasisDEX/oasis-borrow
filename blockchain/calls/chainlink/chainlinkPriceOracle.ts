import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { ChainlinkPriceOracle } from 'types/web3-v1-contracts/chainlink-price-oracle'

import { CallDef } from '../callsHelpers'

const USD_CHAINLINK_PRECISION = 8
export interface AaveAssetsPricesParameters {
  tokens: string[]
}

export const getChainlinkUSDCUSDPrice: CallDef<void, BigNumber> = {
  call: (_, { contract, chainlinkUsdcUsdPriceOracle }) =>
    contract<ChainlinkPriceOracle>(chainlinkUsdcUsdPriceOracle).methods.latestAnswer,
  prepareArgs: () => [],
  postprocess: (answer) => {
    return amountFromWei(answer, USD_CHAINLINK_PRECISION)
  },
}
