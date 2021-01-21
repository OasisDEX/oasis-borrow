import BigNumber from 'bignumber.js'
import { Ilk } from 'features/ilks/ilks'
import Web3 from 'web3'

import { McdSpot } from '../../../types/web3-v1-contracts/mcd-spot'
import { amountFromRay } from '../utils'
import { CallDef } from './callsHelpers'

export interface SpotIlkData<Ilk> {
  priceFeedAddress: string
  liquidationRatio: BigNumber
}

export const spotIlks: CallDef<Ilk, SpotIlkData<Ilk>> = {
  call: (_, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.ilks,
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  //  postprocess: ({ 0: pip, 1: mat }: any) => ({
  postprocess: ({ pip, mat }: any) => ({
    priceFeedAddress: pip,
    // ETH/USD =
    liquidationRatio: amountFromRay(new BigNumber(mat)),
  }),
}

export const spotPar: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.par,
  prepareArgs: () => [],
  postprocess: (result: any) => amountFromRay(new BigNumber(result)),
}
