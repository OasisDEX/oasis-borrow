import { AaveProtocolDataProvider } from '@oasis-borrow/types/web3-v1-contracts/aave-protocol-data-provider'
import BigNumber from 'bignumber.js'

import { CallDef } from './callsHelpers'

export const getAaveUserReserveData: CallDef<
  { token: string; proxyAddress: string },
  { currentATokenBalance: BigNumber }
> = {
  call: (args, { contract, aaveProtocolDataProvider }) => {
    return contract<AaveProtocolDataProvider>(aaveProtocolDataProvider).methods.getUserReserveData
  },
  prepareArgs: ({ token, proxyAddress }, context) => {
    return [context.tokens[token].address, proxyAddress]
  },
}
