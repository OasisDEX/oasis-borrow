import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { McdDog } from 'types/ethers-contracts/McdDog'
import Web3 from 'web3'

import { WAD } from '../../components/constants'
import { CallDef } from './callsHelpers'

export interface DogIlk {
  liquidatorAddress: string
  liquidationPenalty: BigNumber
}

export const dogIlk: CallDef<string, DogIlk> = {
  call: (_, { contract, mcdDog }) => contract<McdDog>(mcdDog).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ({ clip, chop }: any) => ({
    liquidatorAddress: clip,
    liquidationPenalty: amountFromWei(new BigNumber(chop).minus(WAD)),
  }),
}
