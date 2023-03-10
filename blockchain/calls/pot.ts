import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { SECONDS_PER_YEAR } from 'components/constants'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { McdPot } from '../../types/web3-v1-contracts/mcd-pot'
import { amountFromRay } from '../utils'
import { CallDef } from './callsHelpers'

export const potPie: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdPot }) => contract<McdPot>(mcdPot).methods.Pie,
  prepareArgs: () => [],
  postprocess: (result) => amountFromWei(result),
}

export const potpie: CallDef<string, BigNumber> = {
  call: (_, { contract, mcdPot }) => contract<McdPot>(mcdPot).methods.pie,
  prepareArgs: (address) => [address],
  postprocess: (result) => amountFromWei(result),
}

export const potDsr: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdPot }) => contract<McdPot>(mcdPot).methods.dsr,
  prepareArgs: () => [],
  postprocess: (result) => amountFromRay(result),
}

export const potChi: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdPot }) => contract<McdPot>(mcdPot).methods.chi,
  prepareArgs: () => [],
  postprocess: (result) => amountFromRay(result),
}

export const potRho: CallDef<void, Date> = {
  call: (_, { contract, mcdPot }) => contract<McdPot>(mcdPot).methods.rho(),
  prepareArgs: () => [],
  postprocess: (result: any) => new Date(result.toNumber() * 1000),
}

export function annualDaiSavingsRate$(potDsr$: Observable<BigNumber>) {
  return potDsr$.pipe(map((dsr) => dsr.pow(SECONDS_PER_YEAR).minus(1).times(100)))
}
