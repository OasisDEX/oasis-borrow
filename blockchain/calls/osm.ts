import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { McdOsm } from 'types/web3-v1-contracts'
import Web3 from 'web3'

import type { CallDef } from './callsHelpers'

export const pipZzz: CallDef<string, BigNumber> = {
  call: (token, { contract, chainId }) =>
    contract<McdOsm>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdOsms[token]).methods.zzz,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result).times(1000),
}

export const pipHop: CallDef<string, BigNumber> = {
  call: (token, { contract, chainId }) =>
    contract<McdOsm>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdOsms[token]).methods.hop,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result).times(1000),
}

export const pipPeek: CallDef<string, [string, boolean]> = {
  call: (token, { contract, chainId }) =>
    contract<McdOsm>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdOsms[token]).methods.peek,
  prepareArgs: () => [],
  postprocess: (result) => {
    return [Web3.utils.hexToNumberString(result[0] as string), result[1]]
  },
}

export const pipPeep: CallDef<string, [string, boolean]> = {
  call: (token, { contract, chainId }) =>
    contract<McdOsm>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdOsms[token]).methods.peep,
  prepareArgs: () => [],
  postprocess: (result) => {
    return [Web3.utils.hexToNumberString(result[0] as string), result[1]]
  },
}
