import Web3 from 'web3'

import { CdpRegistry } from '../../types/web3-v1-contracts/cdp-registry'
import { CallDef } from './callsHelpers'

export const cdpRegistryOwns: CallDef<{ ilk: string; usr: string }, string> = {
  call: (_, { contract, cdpRegistry }) => contract<CdpRegistry>(cdpRegistry).methods.owns,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (address: any) => address,
}
