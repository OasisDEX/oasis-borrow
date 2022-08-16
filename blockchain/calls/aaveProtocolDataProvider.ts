import { AaveProtocolDataProvider } from '@oasis-borrow/types/web3-v1-contracts/aave-protocol-data-provider'

import { CallDef } from './callsHelpers'
import BigNumber from 'bignumber.js'

export const getAaveUserReserveData: CallDef<
  { token: string; proxyAddress: string },
  { currentATokenBalance: BigNumber }
> = {
  call: (args, { contract, aaveProtocolDataProvider }) => {
    console.log('args:', args)
    return contract<AaveProtocolDataProvider>(aaveProtocolDataProvider).methods.getUserReserveData
  },
  prepareArgs: ({ token, proxyAddress }, context) => {
    console.log('args:', [context.tokens[token].address, proxyAddress])
    return [context.tokens[token].address, proxyAddress]
  },
  postprocess: (result) => {
    console.log('result:', result)
    return result
  },
}
