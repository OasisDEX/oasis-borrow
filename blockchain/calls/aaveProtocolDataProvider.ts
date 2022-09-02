import BigNumber from 'bignumber.js'

import { AaveProtocolDataProvider } from '../../types/web3-v1-contracts/aave-protocol-data-provider'
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

export type AaveReserveConfigurationData = {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  // .... could add more things here.  see https://etherscan.io/address/0x057835ad21a177dbdd3090bb1cae03eacf78fc6d#readContract
}

export const getAaveReserveConfigurationData: CallDef<
  { token: string },
  AaveReserveConfigurationData
> = {
  call: (args, { contract, aaveProtocolDataProvider }) => {
    return contract<AaveProtocolDataProvider>(aaveProtocolDataProvider).methods
      .getReserveConfigurationData
  },
  prepareArgs: ({ token }, context) => {
    return [context.tokens[token].address]
  },
  postprocess: (result) => {
    return {
      ltv: new BigNumber(result.ltv),
      liquidationThreshold: new BigNumber(result.liquidationThreshold),
    }
  },
}
