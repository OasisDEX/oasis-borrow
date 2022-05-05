import BigNumber from 'bignumber.js'
import Web3 from 'web3'

import { CdpRegistry } from '../../types/web3-v1-contracts/cdp-registry'
import { CallDef } from './callsHelpers'

export const cdpRegistryOwns: CallDef<BigNumber, string> = {
  call: (_, { contract, cdpRegistry }) => contract<CdpRegistry>(cdpRegistry).methods.owns,
  prepareArgs: (cdpId) => [cdpId.toString()],
  postprocess: (address: any) => address,
}

export const cdpRegistryCdps: CallDef<{ ilk: string; usr: string }, BigNumber | null> = {
  call: (_, { contract, cdpRegistry }) => contract<CdpRegistry>(cdpRegistry).methods.cdps,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (cdpId: any) => {
    return parseInt(cdpId) === 0 ? null : new BigNumber(cdpId)
  },
}
