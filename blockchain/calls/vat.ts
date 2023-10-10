import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { amountFromRad, amountFromRay } from 'blockchain/utils'
import type { Vat } from 'types/web3-v1-contracts'
import Web3 from 'web3'

import type { CallDef } from './callsHelpers'

export interface VatUrnsArgs {
  ilk: string
  urnAddress: string
}

export interface Urn {
  collateral: BigNumber
  normalizedDebt: BigNumber
}

export const vatUrns: CallDef<VatUrnsArgs, Urn> = {
  call: (_, { contract, chainId }) => {
    return contract<Vat>(getNetworkContracts(NetworkIds.MAINNET, chainId).vat).methods.urns
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: (urn: any) => ({
    collateral: amountFromWei(new BigNumber(urn.ink)),
    normalizedDebt: amountFromWei(new BigNumber(urn.art)),
  }),
}

export interface VatIlk {
  normalizedIlkDebt: BigNumber // Art [wad]
  debtScalingFactor: BigNumber // rate [ray]
  maxDebtPerUnitCollateral: BigNumber // spot [ray]
  debtCeiling: BigNumber // line [rad]
  debtFloor: BigNumber // debtFloor [rad]
}

export const vatIlk: CallDef<string, VatIlk> = {
  call: (_, { contract, chainId }) => {
    return contract<Vat>(getNetworkContracts(NetworkIds.MAINNET, chainId).vat).methods.ilks
  },
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  postprocess: (ilk: any) => ({
    normalizedIlkDebt: amountFromWei(new BigNumber(ilk.Art)),
    debtScalingFactor: amountFromRay(new BigNumber(ilk.rate)),
    maxDebtPerUnitCollateral: amountFromRay(new BigNumber(ilk.spot)),
    debtCeiling: amountFromRad(new BigNumber(ilk.line)),
    debtFloor: amountFromRad(new BigNumber(ilk.dust)),
  }),
}

export interface VatGemArgs {
  ilk: string
  urnAddress: string
}

export const vatGem: CallDef<VatGemArgs, BigNumber> = {
  call: (_, { contract, chainId }) => {
    return contract<Vat>(getNetworkContracts(NetworkIds.MAINNET, chainId).vat).methods.gem
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: (gem) => amountFromWei(new BigNumber(gem)),
}

export const vatLine: CallDef<{}, BigNumber> = {
  call: (_, { contract, chainId }) => {
    return contract<Vat>(getNetworkContracts(NetworkIds.MAINNET, chainId).vat).methods.Line
  },
  prepareArgs: () => [],
}
