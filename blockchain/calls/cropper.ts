import { DssCropper } from '../../types/web3-v1-contracts/dss-cropper'
import { CallDef } from './callsHelpers'
import { DssCropJoin } from '../../types/web3-v1-contracts/dss-crop-join'
import { McdGemJoin } from '../../types/web3-v1-contracts/mcd-gem-join'
import { contractDesc } from '../config'
import * as mcdCropJoinAbi from '../abi/dss-crop-join.json'

export const cropperUrnProxy: CallDef<string, string> = {
  call: (_, { contract, dssCropper }) => {
    return contract<DssCropper>(dssCropper).methods.proxy
  },
  prepareArgs: (usr) => [usr],
}

export const cropperCrops: CallDef<{ ilk: string; usr: string }, string> = {
  call: ({ ilk }, { contract, joins }) => {
    const join = joins[ilk]
    const cd = contractDesc(mcdCropJoinAbi, join)
    debugger
    const thing = contract<DssCropJoin>(cd)
    return thing.methods.crops
  },
  prepareArgs: ({ usr }) => [usr],
}

// @ts-ignore
cropperCrops.prepareArgs.anthony = true
