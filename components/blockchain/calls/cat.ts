import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { McdCat } from 'types/web3-v1-contracts/mcd-cat'
import Web3 from 'web3'

import { CallDef } from './callsHelpers'
import { amountFromRad, } from '../utils'
import { WAD } from '../../constants'

interface CatIlksResult {
  liquidatorAddress: string;
  liquidationPenalty: BigNumber,
  maxAuctionLotSize: BigNumber
}

export const catIlks: CallDef<string, CatIlksResult> = {
  call: (collateralTypeName, { contract, mcdCat }) =>
    contract<McdCat>(mcdCat).methods.ilks(collateralTypeName),
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ([liquidatorAddress, liquidationPenalty, maxAuctionLotSize]: any) => ({
    liquidatorAddress,
    liquidationPenalty: amountFromWei(liquidationPenalty).minus(WAD),
    maxAuctionLotSize: amountFromRad(maxAuctionLotSize)
  })
}
