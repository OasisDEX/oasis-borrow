import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { amountFromRay } from 'blockchain/utils'
import type { McdSpot } from 'types/web3-v1-contracts'
import Web3 from 'web3'

import type { CallDef } from './callsHelpers'

export interface SpotIlk {
  priceFeedAddress: string
  liquidationRatio: BigNumber
}

export const spotIlk: CallDef<string, SpotIlk> = {
  call: (_, { contract, chainId }) =>
    contract<McdSpot>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdSpot).methods.ilks,
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  //  postprocess: ({ 0: pip, 1: mat }: any) => ({
  postprocess: ({ pip, mat }: any) => ({
    priceFeedAddress: pip,
    liquidationRatio: amountFromRay(new BigNumber(mat)),
  }),
}

export const spotPar: CallDef<void, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<McdSpot>(getNetworkContracts(NetworkIds.MAINNET, chainId).mcdSpot).methods.par,
  prepareArgs: () => [],
  postprocess: (result: any) => amountFromRay(new BigNumber(result)),
}
