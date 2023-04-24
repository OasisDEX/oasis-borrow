import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { DssCdpManager } from 'types/web3-v1-contracts'
import Web3 from 'web3'

import { CallDef } from './callsHelpers'

export const cdpManagerUrns: CallDef<BigNumber, string> = {
  call: (_, { contract, chainId }) => {
    return contract<DssCdpManager>(getNetworkContracts(chainId).dssCdpManager).methods.urns
  },
  prepareArgs: (id) => [id],
}

export const cdpManagerIlks: CallDef<BigNumber, string> = {
  call: (_, { contract, chainId }) => {
    return contract<DssCdpManager>(getNetworkContracts(chainId).dssCdpManager).methods.ilks
  },
  prepareArgs: (id) => [id],
  postprocess: (ilk) => Web3.utils.hexToUtf8(ilk),
}

export const cdpManagerCdpi: CallDef<void, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<DssCdpManager>(getNetworkContracts(chainId).dssCdpManager).methods.cdpi,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result),
}

export const cdpManagerOwner: CallDef<BigNumber, string> = {
  call: (_, { contract, chainId }) =>
    contract<DssCdpManager>(getNetworkContracts(chainId).dssCdpManager).methods.owns,
  prepareArgs: (id) => [id],
}
