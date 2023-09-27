import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { RAD, RAY, WAD } from 'components/constants'
import type { DssCharter } from 'types/web3-v1-contracts'
import Web3 from 'web3'

import type { CallDef } from './callsHelpers'

export const charterNib: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<DssCharter>(getNetworkContracts(NetworkIds.MAINNET, chainId).dssCharter).methods.nib,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (nib: any) => new BigNumber(nib).div(WAD),
}

export const charterPeace: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<DssCharter>(getNetworkContracts(NetworkIds.MAINNET, chainId).dssCharter).methods.peace,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (peace: any) => new BigNumber(peace).div(RAY),
}

export const charterUline: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<DssCharter>(getNetworkContracts(NetworkIds.MAINNET, chainId).dssCharter).methods.uline,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (uline: any) => new BigNumber(uline).div(RAD),
}

// usr is the dssProxy address
export const charterUrnProxy: CallDef<string, string> = {
  call: (_, { contract, chainId }) =>
    contract<DssCharter>(getNetworkContracts(NetworkIds.MAINNET, chainId).dssCharter).methods.proxy,
  prepareArgs: (usr) => [usr],
}
