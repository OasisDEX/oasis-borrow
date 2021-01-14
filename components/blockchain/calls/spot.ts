import BigNumber from 'bignumber.js'
import Web3 from 'web3'

import { McdSpot } from '../../../types/web3-v1-contracts/mcd-spot'
import { amountFromRay } from '../utils'
import { CallDef } from './callsHelpers'

interface SpotIlksResult {
  priceFeedAddress: string
  liquidationRatio: BigNumber
}

function deb<R>(f: (...args: any) => R): (...args: any) => R {
  return (...args: any) => {
    console.log(f, ...args)
    return f(...args)
  }
}

export const spotIlks: CallDef<string, SpotIlksResult> = {
  call: (_, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.ilks,
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  postprocess: deb(({ 0: pip, 1: mat }: any) => ({
    priceFeedAddress: pip,
    liquidationRatio: amountFromRay(new BigNumber(mat)),
  })),
}

export const spotPar: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.par,
  prepareArgs: () => [],
  postprocess: (result: any) => amountFromRay(new BigNumber(result)),
}
