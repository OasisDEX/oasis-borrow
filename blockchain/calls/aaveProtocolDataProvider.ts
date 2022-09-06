import BigNumber from 'bignumber.js'

import { AaveProtocolDataProvider } from '../../types/web3-v1-contracts/aave-protocol-data-provider'
import { CallDef } from './callsHelpers'

export interface AaveUserReserveDataParameters {
  token: string
  proxyAddress: string
}

export interface AaveUserReserveData {
  currentATokenBalance: BigNumber
}

export const getAaveUserReserveData: CallDef<AaveUserReserveDataParameters, AaveUserReserveData> = {
  call: (args, { contract, aaveProtocolDataProvider }) => {
    return contract<AaveProtocolDataProvider>(aaveProtocolDataProvider).methods.getUserReserveData
  },
  prepareArgs: ({ token, proxyAddress }, context) => {
    return [context.tokens[token].address, proxyAddress]
  },
}
