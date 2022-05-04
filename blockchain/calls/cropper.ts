import BigNumber from 'bignumber.js'
import Web3 from 'web3'

import { DssCropper } from '../../types/web3-v1-contracts/dss-cropper'
import * as mcdCropJoinAbi from '../abi/dss-crop-join.json'
import { CallDef } from './callsHelpers'

export const cropperUrnProxy: CallDef<string, string> = {
  call: (_, { contract, dssCropper }) => contract<DssCropper>(dssCropper).methods.proxy,
  prepareArgs: (usr) => [usr],
}

function createContract(web3: Web3, joins: { [p: string]: string }, ilk: string) {
  const join = joins[ilk]
  return new web3.eth.Contract((mcdCropJoinAbi as any).default, join)
}

export const cropperCrops: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: ({ ilk }, { web3, joins }) => {
    const contract = createContract(web3, joins, ilk)
    return contract.methods.crops
  },
  prepareArgs: ({ usr }) => [usr],
  postprocess: (result: any) => {
    return new BigNumber(result) // crops per user  [bonus decimals]
  },
}

export const cropperStake: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: ({ ilk }, { web3, joins }) => {
    const contract = createContract(web3, joins, ilk)
    return contract.methods.stake
  },
  prepareArgs: ({ usr }) => [usr],
  postprocess: (result: any) => {
    return new BigNumber(result) // gems per user   [wad]
  },
}

export const cropperShare: CallDef<{ ilk: string }, BigNumber> = {
  call: ({ ilk }, { web3, joins }) => {
    const contract = createContract(web3, joins, ilk)
    return contract.methods.share
  },
  prepareArgs: () => [],
  postprocess: (result: any) => {
    return new BigNumber(result) // crops per gem    [bonus decimals * ray / wad]
  },
}

export const cropperBonusTokenAddress: CallDef<{ ilk: string }, string> = {
  call: ({ ilk }, { web3, joins }) => {
    const contract = createContract(web3, joins, ilk)
    return contract.methods.bonus
  },
  prepareArgs: () => [],
}

export const cropperStock: CallDef<{ ilk: string }, BigNumber> = {
  call: ({ ilk }, { web3, joins }) => {
    const contract = createContract(web3, joins, ilk)
    return contract.methods.stock
  },
  prepareArgs: () => [],
  postprocess: (result: any) => {
    return new BigNumber(result) // crop balance     [bonus decimals]
  },
}

export const cropperTotal: CallDef<{ ilk: string }, BigNumber> = {
  call: ({ ilk }, { web3, joins }) => {
    const contract = createContract(web3, joins, ilk)
    return contract.methods.total
  },
  prepareArgs: () => [],
  postprocess: (result: any) => {
    return new BigNumber(result) // total gems       [wad]
  },
}
