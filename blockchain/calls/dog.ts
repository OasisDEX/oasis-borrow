import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { WAD } from 'components/constants'
import { McdDog } from 'types/web3-v1-contracts'
import Web3 from 'web3'

export interface DogIlk {
  liquidatorAddress: string
  liquidationPenalty: BigNumber
}

export const dogIlk: CallDef<string, DogIlk> = {
  call: (_, { contract, chainId }) =>
    contract<McdDog>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdDog).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ({ clip, chop }: any) => ({
    liquidatorAddress: clip,
    liquidationPenalty: amountFromWei(new BigNumber(chop).minus(WAD)),
  }),
}
