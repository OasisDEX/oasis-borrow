import BigNumber from 'bignumber.js'
import { RAD, RAY, WAD } from 'components/constants'
import Web3 from 'web3'

import { DssCharter } from '../../types/web3-v1-contracts/dss-charter'
import { CallDef } from './callsHelpers'

export const charterNib: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: (_, { contract, dssCharter }) => contract<DssCharter>(dssCharter).methods.nib,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (nib: any) => new BigNumber(nib).div(WAD),
}

export const charterPeace: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: (_, { contract, dssCharter }) => contract<DssCharter>(dssCharter).methods.peace,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (peace: any) => new BigNumber(peace).div(RAY),
}

export const charterUline: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: (_, { contract, dssCharter }) => contract<DssCharter>(dssCharter).methods.uline,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (uline: any) => new BigNumber(uline).div(RAD),
}

// usr is the dssProxy address
export const charterUrnProxy: CallDef<string, string> = {
  call: (_, { contract, dssCharter }) => contract<DssCharter>(dssCharter).methods.proxy,
  prepareArgs: (usr) => [usr],
}
