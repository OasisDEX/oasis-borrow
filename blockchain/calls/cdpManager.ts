import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { DssCdpManager } from 'types/web3-v1-contracts'
import Web3 from 'web3'

import type { CallDef } from './callsHelpers'

export const cdpManagerUrns: CallDef<BigNumber, string> = {
  call: (_, { contract, chainId }) => {
    return contract<DssCdpManager>(getNetworkContracts(NetworkIds.MAINNET, chainId).dssCdpManager)
      .methods.urns
  },
  prepareArgs: (id) => [id.toNumber()],
}

export const cdpManagerIlks: CallDef<BigNumber, string> = {
  call: (_, { contract, chainId }) => {
    return contract<DssCdpManager>(getNetworkContracts(NetworkIds.MAINNET, chainId).dssCdpManager)
      .methods.ilks
  },
  prepareArgs: (id) => [id.toNumber()],
  postprocess: (ilk) => Web3.utils.hexToUtf8(ilk),
}

export const cdpManagerCdpi: CallDef<void, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<DssCdpManager>(getNetworkContracts(NetworkIds.MAINNET, chainId).dssCdpManager).methods
      .cdpi,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result),
}

export const cdpManagerOwner: CallDef<BigNumber, string> = {
  call: (_, { contract, chainId }) =>
    contract<DssCdpManager>(getNetworkContracts(NetworkIds.MAINNET, chainId).dssCdpManager).methods
      .owns,
  prepareArgs: (id) => [id.toNumber()],
}
