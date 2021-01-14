import BigNumber from 'bignumber.js'
import { DssCdpManager } from 'types/web3-v1-contracts/dss-cdp-manager'
import Web3 from 'web3'

import { CallDef } from './callsHelpers'

export const cdpManagerUrns: CallDef<BigNumber, string> = {
  call: (_, { contract, dssCdpManager }) => {
    return contract<DssCdpManager>(dssCdpManager).methods.urns
  },
  prepareArgs: (id) => [id],
}

export const cdpManagerIlks: CallDef<BigNumber, string> = {
  call: (_, { contract, dssCdpManager }) => {
    return contract<DssCdpManager>(dssCdpManager).methods.ilks
  },
  prepareArgs: (id) => [id],
  postprocess: (ilk) => Web3.utils.hexToUtf8(ilk),
}

export const cdpManagerCdpi: CallDef<void, BigNumber> = {
  call: (_, { contract, dssCdpManager }) => contract<DssCdpManager>(dssCdpManager).methods.cdpi,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result),
}

export const cdpManagerOwner: CallDef<BigNumber, string> = {
  call: (_, { contract, dssCdpManager }) => contract<DssCdpManager>(dssCdpManager).methods.owns,
  prepareArgs: (id) => [id],
}
