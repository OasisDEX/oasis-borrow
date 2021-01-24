import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { Vat } from 'types/web3-v1-contracts/vat'
import Web3 from 'web3'
import { Integer, wrap as wrapInteger } from 'money-ts/lib/Integer'

import { amountFromRad, amountFromRay } from '../utils'
import { CallDef } from './callsHelpers'
import { $createCollateralUnsafe, Collateral, Ilk } from '../ilks'
import { RadDai, RayDAI } from '../tokens'

interface VatUrnsArgs {
  ilk: Ilk
  urnAddress: string
}

export interface Urn<I extends Ilk> {
  collateral: Collateral<I>
  normalizedDebt: Integer
}

export interface Urn<I extends Ilk> {
  collateral: Collateral<I>
  normalizedDebt: Integer
}

const vatUrnsUnsafe: CallDef<VatUrnsArgs, Urn<Ilk>> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.urns
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: ({ ink, art }: any, { ilk }: VatUrnsArgs) => ({
    collateral: $createCollateralUnsafe(ilk, ink),
    normalizedDebt: wrapInteger(art),
  }),
}

export const vatUrns = vatUrnsUnsafe

export interface VatIlk<I extends Ilk> {
  ilk: I
  normalizedIlkDebt: Integer
  debtScalingFactor: Integer
  maxDebtPerUnitCollateral: RayDAI
  debtCeiling: RadDai
  debtFloor: RadDai
}

export const vatIlks: CallDef<Ilk, VatIlk<Ilk>> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.ilks
  },
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  postprocess: (ilk) => ({
    normalizedIlkDebt: amountFromWei(new BigNumber(ilk.Art)),
    debtScalingFactor: amountFromRay(new BigNumber(ilk.rate)),
    maxDebtPerUnitCollateral: amountFromRay(new BigNumber(ilk.spot)),
    debtCeiling: amountFromRad(new BigNumber(ilk.line)),
    debtFloor: amountFromRad(new BigNumber(ilk.dust)),
  }),
}

interface VatGemArgs {
  ilk: Ilk
  urnAddress: string
}

export const vatGem: CallDef<VatGemArgs, BigNumber> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.gem
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: (gem) => new BigNumber(gem),
}

export const vatLine: CallDef<{}, BigNumber> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.Line
  },
  prepareArgs: () => [],
}
