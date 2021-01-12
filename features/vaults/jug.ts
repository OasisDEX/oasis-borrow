import BigNumber from 'bignumber.js'
import Web3 from 'web3'

import { CallDef } from '../../components/blockchain/calls/callsHelpers'
import { RAY, SECONDS_PER_YEAR } from '../../components/constants'
import { McdJug } from '../../types/web3-v1-contracts/mcd-jug'

export const jugIlks: CallDef<string, [BigNumber, Date]> = {
  call: (collateralTypeName, { contract, mcdJug }) =>
    contract<McdJug>(mcdJug).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ([rawFee, rawLastLevied]: any) => {
    const v = new BigNumber(rawFee).dividedBy(RAY);
    BigNumber.config({ POW_PRECISION: 100 });
    const stabilityFee = v.pow(SECONDS_PER_YEAR).minus(1);
    const lastLevied = new Date(rawLastLevied * 1000)
    return [stabilityFee, lastLevied]
  }
}

// BASE_COLLATERAL_FEE
export const jugBase: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.base,
  prepareArgs: () => [],
  postprocess: (result: any) => new BigNumber(result)
}
