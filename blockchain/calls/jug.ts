import BigNumber from 'bignumber.js'
import { RAY, SECONDS_PER_YEAR } from 'components/constants'
import Web3 from 'web3'

import { McdJug } from '../../types/web3-v1-contracts/mcd-jug'
import { CallDef } from './callsHelpers'

export interface JugIlk {
  stabilityFee: BigNumber
  feeLastLevied: Date
}
export const jugIlk: CallDef<string, JugIlk> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ({ 0: rawFee, 1: rawLastLevied }: any) => {
    const v = new BigNumber(rawFee).dividedBy(RAY)
    BigNumber.config({ POW_PRECISION: 100 })
    const stabilityFee = v.pow(SECONDS_PER_YEAR).minus(1)
    const feeLastLevied = new Date(rawLastLevied * 1000)
    return { stabilityFee, feeLastLevied }
  },
}

// BASE_COLLATERAL_FEE
export const jugBase: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.base,
  prepareArgs: () => [],
  postprocess: (result: any) => new BigNumber(result),
}
