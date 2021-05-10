import BigNumber from 'bignumber.js'
import Web3 from 'web3'

import { McdSpot } from '../../types/web3-v1-contracts/mcd-spot'
import { amountFromRay } from '../utils'
import { CallDef } from './callsHelpers'

export interface SpotIlk {
  priceFeedAddress: string
  liquidationRatio: BigNumber
}

export const spotIlk: CallDef<string, SpotIlk> = {
  call: (_, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.ilks,
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  //  postprocess: ({ 0: pip, 1: mat }: any) => ({
  postprocess: ({ pip, mat }: any) => ({
    priceFeedAddress: pip,
    liquidationRatio: amountFromRay(new BigNumber(mat)),
  }),
}

export const spotPar: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.par,
  prepareArgs: () => [],
  postprocess: (result: any) => amountFromRay(new BigNumber(result)),
}
