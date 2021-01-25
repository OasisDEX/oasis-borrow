import BigNumber from 'bignumber.js'
import { $Int, $Nat, $NzInt } from 'components/atoms/numeric'
import { one } from 'money-ts/lib/Natural'
import Web3 from 'web3'
import * as Int from 'money-ts/lib/Integer'
import * as Rat from 'money-ts/lib/Rational'
import * as Nat from 'money-ts/lib/Natural'

import { McdJug } from '../../../types/web3-v1-contracts/mcd-jug'
import { Ilk } from '../ilks'
import { CallDef } from './callsHelpers'
import { RAD, RAY } from '../constants'

export interface JugIlk<I extends Ilk> {
  ilk: I
  stabilityFee: Rat.Rational
  dateFeeLastLevied: Date
}

export const jugIlks: CallDef<Ilk, JugIlk<Ilk>> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ({ duty, rho }: any, ilk) => {
    const dutyRational = [$Int(duty), $Nat(RAY)] as Rat.Rational

    console.log(Rat.show(Rat.reduce($Int(duty), $Nat(RAY))))
    // BigNumber.config({ POW_PRECISION: 100 })
    // const _stabilityFee = bigInt(duty).pow(SECONDS_PER_YEAR).minus(1)
    // const feeLastLevied = new Date(rawLastLevied * 1000)
    // return { stabilityFee, feeLastLevied }
    return {
      ilk,
      stabilityFee: dutyRational,
      dateFeeLastLevied: new Date(parseInt(rho) * 1000),
    }
  },
}

export const jugBase: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.base,
  prepareArgs: () => [],
  postprocess: (result: any) => new BigNumber(result),
}
