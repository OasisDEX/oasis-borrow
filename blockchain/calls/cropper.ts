import BigNumber from 'bignumber.js'

import { DssCropper } from '../../types/web3-v1-contracts/dss-cropper'
import * as mcdCropJoinAbi from '../abi/dss-crop-join.json'
import { CallDef } from './callsHelpers'

export const cropperUrnProxy: CallDef<string, string> = {
  call: (_, { contract, dssCropper }) => {
    return contract<DssCropper>(dssCropper).methods.proxy
  },
  prepareArgs: (usr) => [usr],
}

// returns the bonuses allocated to the usr
export const cropperCrops: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: ({ ilk }, { web3, joins }) => {
    const join = joins[ilk]
    const contract = new web3.eth.Contract((mcdCropJoinAbi as any).default, join)
    return contract.methods.crops
  },
  prepareArgs: ({ usr }) => [usr],
  postprocess: (result: any) => {
    return new BigNumber(result) // crops per user  [bonus decimals]
  },
}

export const cropperStake: CallDef<{ ilk: string; usr: string }, BigNumber> = {
  call: ({ ilk }, { web3, joins }) => {
    const join = joins[ilk]
    const contract = new web3.eth.Contract((mcdCropJoinAbi as any).default, join)
    return contract.methods.stake
  },
  prepareArgs: ({ usr }) => [usr],
  postprocess: (result: any) => {
    return new BigNumber(result) // gems for user (wad)
  },
}

export const cropperShare: CallDef<{ ilk: string }, BigNumber> = {
  call: ({ ilk }, { web3, joins }) => {
    const join = joins[ilk]
    const contract = new web3.eth.Contract((mcdCropJoinAbi as any).default, join)
    return contract.methods.share
  },
  prepareArgs: () => [],
  postprocess: (result: any) => {
    return new BigNumber(result) // crops per gem    [bonus decimals * ray / wad]
  },
}

// returns bonus token address for the cropjoin ilk
export const cropperBonusTokenAddress: CallDef<{ ilk: string }, string> = {
  call: ({ ilk }, { web3, joins }) => {
    const join = joins[ilk]
    const contract = new web3.eth.Contract((mcdCropJoinAbi as any).default, join)
    return contract.methods.bonus
  },
  prepareArgs: () => [],
}
