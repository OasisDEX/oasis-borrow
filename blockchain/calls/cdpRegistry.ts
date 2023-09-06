import BigNumber from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { CdpRegistry } from 'types/web3-v1-contracts'
import Web3 from 'web3'

export const cdpRegistryOwns: CallDef<BigNumber, string> = {
  call: (_, { contract, chainId }) =>
    contract<CdpRegistry>(getNetworkContracts(NetworkIds.MAINNET, chainId).cdpRegistry).methods
      .owns,
  prepareArgs: (cdpId) => [cdpId.toString()],
  postprocess: (address: any) => address,
}

export const cdpRegistryCdps: CallDef<{ ilk: string; usr: string }, BigNumber | null> = {
  call: (_, { contract, chainId }) =>
    contract<CdpRegistry>(getNetworkContracts(NetworkIds.MAINNET, chainId).cdpRegistry).methods
      .cdps,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (cdpId: any) => {
    return parseInt(cdpId) === 0 ? null : new BigNumber(cdpId)
  },
}
