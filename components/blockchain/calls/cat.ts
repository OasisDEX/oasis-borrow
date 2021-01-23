import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { Fraction } from 'components/atoms/fraction'
import { McdCat } from 'types/web3-v1-contracts/mcd-cat'
import Web3 from 'web3'

import { WAD } from '../../constants'
import { RadDai } from '../config/tokens'
import { Ilk } from '../ilks'
import { amountFromRad } from '../utils'
import { CallDef } from './callsHelpers'

export interface CatIlk<I extends Ilk> {
  _tag: I
  liquidatorAddress: string
  liquidationPenalty: Fraction
  maxDebtPerAuctionLot: RadDai
}

export const catIlks: CallDef<Ilk, CatIlk<Ilk>> = {
  call: (_, { contract, mcdCat }) => contract<McdCat>(mcdCat).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ({ flip, chop, dunk }: any) => ({
    liquidatorAddress: flip,
    liquidationPenalty: amountFromWei(new BigNumber(chop).minus(WAD)),
    maxAuctionLotSize: amountFromRad(new BigNumber(dunk)),
  }),
}
