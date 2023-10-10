import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { McdEnd } from 'types/web3-v1-contracts'

import type { CallDef } from './callsHelpers'

export const endLive: CallDef<void, boolean> = {
  call: (_, { contract, chainId }) =>
    contract<McdEnd>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdEnd).methods.live,
  prepareArgs: () => [],
  postprocess: (result: any) => result.eq(0),
}

export const endWhen: CallDef<void, Date> = {
  call: (_, { contract, chainId }) =>
    contract<McdEnd>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdEnd).methods.when,
  prepareArgs: () => [],
  postprocess: (result: any) => new Date(result.toNumber() * 1000),
}
