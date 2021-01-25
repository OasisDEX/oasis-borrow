import { Vat } from 'types/web3-v1-contracts/vat'
import Web3 from 'web3'
import { Integer } from 'money-ts/lib/Integer'

import { CallDef } from './callsHelpers'
import { $createCollateralUnsafe, Collateral, Ilk } from '../ilks'
import { $RadDai, $RayDai, RadDai, RayDAI } from '../tokens'
import { $Int } from 'components/atoms/numeric'

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
    normalizedDebt: $Int(art),
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
  postprocess: ({ Art, rate, spot, line, dust }: any, ilk) => ({
    ilk,
    normalizedIlkDebt: $Int(Art),
    debtScalingFactor: $Int(rate),
    maxDebtPerUnitCollateral: $RayDai(spot),
    debtCeiling: $RadDai(line),
    debtFloor: $RadDai(dust),
  }),
}

interface VatGemArgs {
  ilk: Ilk
  urnAddress: string
}

export const vatGem: CallDef<VatGemArgs, Collateral<Ilk>> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.gem
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: (gem: any, { ilk }) => $createCollateralUnsafe(ilk, gem),
}

export const vatLine: CallDef<{}, RadDai> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.Line
  },
  prepareArgs: () => [],
  postprocess: (Line: any) => $RadDai(Line),
}
