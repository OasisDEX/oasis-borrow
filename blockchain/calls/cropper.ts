import { DssCropper } from '../../types/web3-v1-contracts/dss-cropper'
import { CallDef } from './callsHelpers'

export const cropperUrnProxy: CallDef<string, string> = {
  call: (_, { contract, dssCropper }) => contract<DssCropper>(dssCropper).methods.proxy,
  prepareArgs: (usr) => [usr],
}
