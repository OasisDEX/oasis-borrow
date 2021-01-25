import { $Nat, $naturalToString } from 'components/atoms/numeric'
import { Natural } from 'money-ts/lib/Natural'
import { DssCdpManager } from 'types/web3-v1-contracts/dss-cdp-manager'
import Web3 from 'web3'
import { Ilk } from '../ilks'
import { CallDef } from './callsHelpers'

export const cdpManagerUrns: CallDef<Natural, string> = {
  call: (_, { contract, dssCdpManager }) => {
    return contract<DssCdpManager>(dssCdpManager).methods.urns
  },
  prepareArgs: (id) => [$naturalToString(id)],
}

export const cdpManagerIlks: CallDef<Natural, Ilk> = {
  call: (_, { contract, dssCdpManager }) => {
    return contract<DssCdpManager>(dssCdpManager).methods.ilks
  },
  prepareArgs: (id) => [$naturalToString(id)],
  postprocess: (ilkBytes32: any) => Web3.utils.hexToUtf8(ilkBytes32) as Ilk,
}

export const cdpManagerCdpi: CallDef<void, Natural> = {
  call: (_, { contract, dssCdpManager }) => contract<DssCdpManager>(dssCdpManager).methods.cdpi,
  prepareArgs: () => [],
  postprocess: (result: any) => $Nat(result),
}

export const cdpManagerOwner: CallDef<Natural, string> = {
  call: (_, { contract, dssCdpManager }) => contract<DssCdpManager>(dssCdpManager).methods.owns,
  prepareArgs: (id) => [$naturalToString(id)],
}
