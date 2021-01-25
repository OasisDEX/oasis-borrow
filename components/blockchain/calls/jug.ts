import BigNumber from 'bignumber.js'
import { $Int, $Nat, $pow, $ratToPercentage } from 'components/atoms/numeric'
import Web3 from 'web3'
import * as Rat from 'money-ts/lib/Rational'
import * as Int from 'money-ts/lib/Integer'

import { McdJug } from '../../../types/web3-v1-contracts/mcd-jug'
import { Ilk } from '../ilks'
import { CallDef } from './callsHelpers'
import { RAY, SECONDS_PER_YEAR } from '../constants'

export interface JugIlk<I extends Ilk> {
  ilk: I
  stabilityFee: Rat.Rational
  dateFeeLastLevied: Date
}

export const jugIlks: CallDef<Ilk, JugIlk<Ilk>> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ({ duty, rho }: any, ilk) => {
    return {
      ilk,
      stabilityFee: [Int.sub($pow($Int(duty), $Nat(SECONDS_PER_YEAR)), $Int(RAY)), $Nat(RAY)],
      dateFeeLastLevied: new Date(parseInt(rho) * 1000),
    }
  },
}

export const jugBase: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.base,
  prepareArgs: () => [],
  postprocess: (result: any) => new BigNumber(result),
}
