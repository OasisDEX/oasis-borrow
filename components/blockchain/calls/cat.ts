import * as Int from 'money-ts/lib/Integer'
import { McdCat } from 'types/web3-v1-contracts/mcd-cat'
import Web3 from 'web3'
import { Ilk } from '../ilks'
import { $RadDai, RadDai } from '../tokens'
import { CallDef } from './callsHelpers'
import { $Int, $NzInt, $Rat } from 'components/atoms/numeric'
import { WAD } from '../constants'
import { Rational } from 'money-ts/lib/Rational'

export interface CatIlk<I extends Ilk> {
  ilk: I
  liquidatorAddress: string
  liquidationPenalty: Rational
  maxDebtPerAuctionLot: RadDai
}

export const catIlks: CallDef<Ilk, CatIlk<Ilk>> = {
  call: (_, { contract, mcdCat }) => contract<McdCat>(mcdCat).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ({ flip, chop, dunk }: any, ilk) => {
    return {
      ilk,
      liquidatorAddress: flip,
      liquidationPenalty: $Rat(Int.sub($Int(chop), $Int(WAD)), $NzInt(WAD)),
      maxDebtPerAuctionLot: $RadDai(dunk),
    }
  },
}
