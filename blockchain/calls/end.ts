import { getNetworkContracts } from 'blockchain/contracts'
import { McdEnd } from 'types/web3-v1-contracts'

import { CallDef } from './callsHelpers'

export const endLive: CallDef<void, boolean> = {
  call: (_, { contract, chainId }) =>
    contract<McdEnd>(getNetworkContracts(chainId).mcdEnd).methods.live,
  prepareArgs: () => [],
  postprocess: (result: any) => result.eq(0),
}

export const endWhen: CallDef<void, Date> = {
  call: (_, { contract, chainId }) =>
    contract<McdEnd>(getNetworkContracts(chainId).mcdEnd).methods.when,
  prepareArgs: () => [],
  postprocess: (result: any) => new Date(result.toNumber() * 1000),
}
