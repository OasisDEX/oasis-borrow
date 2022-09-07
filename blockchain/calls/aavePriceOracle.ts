import BigNumber from 'bignumber.js'

import { WAD } from '../../components/constants'
import { AavePriceOracle } from '../../types/web3-v1-contracts/aave-price-oracle'
import { CallDef } from './callsHelpers'

export const getAaveAssetPriceData: CallDef<{ token: string }, BigNumber> = {
  call: (args, { contract, aavePriceOracle }) => {
    return contract<AavePriceOracle>(aavePriceOracle).methods.getAssetPrice
  },
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return new BigNumber(result).div(WAD)
  },
}
