import { CallDef } from '../../components/blockchain/calls/callsHelpers'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { amountFromRay } from '../../components/blockchain/utils'
import { McdSpot } from '../../types/web3-v1-contracts/mcd-spot'

type SpotIlksResult = [priceFeedAddress: string| undefined, liquidationRatio: BigNumber | undefined];

export const spotIlks: CallDef<string, SpotIlksResult> = {
  call: (ilk, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.ilks,
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  postprocess: ([priceFeedAddress, liquidationRatio]: SpotIlksResult) =>
    [priceFeedAddress, liquidationRatio ? amountFromRay(liquidationRatio) : undefined]
}

export const spotPar: CallDef<void, BigNumber> = {
  call: (ilk, { contract, mcdSpot }) => contract<McdSpot>(mcdSpot).methods.par,
  prepareArgs: () => [],
  postprocess: (result) => amountFromRay(result)
}
