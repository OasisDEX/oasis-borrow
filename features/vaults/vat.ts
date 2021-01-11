import { ContextConnected } from '../../components/blockchain/network'
import { combineLatest, EMPTY, Observable, of, OperatorFunction, pipe, UnaryFunction } from 'rxjs'
import { filter, mergeMap, switchMap } from 'rxjs/operators'
import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import { filterNullish } from './utils'

interface VatUrnsArgs {
  ilk: string
  urnAddress: string
}

export interface Urn {
  collateral: BigNumber
  normalizedDebt: BigNumber
}

type VatUrnsResult = Urn | undefined

const vatUrns: CallDef<VatUrnsArgs, VatUrnsResult> = {
  call: ({}, { contract, vat }) => {
    return contract(vat).methods['urns']
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: (urn: any) =>
    urn
      ? {
          collateral: new BigNumber(urn.ink),
          normalizedDebt: new BigNumber(urn.art),
        }
      : undefined,
}

export function createVatUrns$(
  connectedContext$: Observable<ContextConnected>,
  cdpManagerUrns$: (id: string) => Observable<string>,
  cdpManagerIlks$: (id: string) => Observable<string>,
  id: string,
): Observable<Urn> {
  return combineLatest(connectedContext$, cdpManagerIlks$(id), cdpManagerUrns$(id)).pipe(
    switchMap(([context, ilk, urnAddress]) => {
      return call(context, vatUrns)({ ilk, urnAddress })
    }),
    filterNullish(),
  )
}

export interface Ilk {
  /*
   * Art [wad]
   */
  globalDebt: BigNumber
  /*
   * rate [ray]
   */
  debtScalingFactor: BigNumber
  /*
   * spot [ray]
   */
  maxDebtPerUnitCollateral: BigNumber
  /*
   * line [rad]
   */
  debtCeiling: BigNumber
  /*
   * debtFloor [rad]
   */
  debtFloor: BigNumber
}

interface VatIlksArgs {
  ilk: string
}

type VatIlksResult = Ilk | undefined

const vatIlks: CallDef<VatIlksArgs, VatIlksResult> = {
  call: ({}, { contract, vat }) => {
    return contract(vat).methods['ilks']
  },
  prepareArgs: ({ ilk }) => [Web3.utils.utf8ToHex(ilk)],
  postprocess: (ilk: any) =>
    ilk
      ? {
          globalDebt: new BigNumber(ilk.Art),
          debtScalingFactor: new BigNumber(ilk.rate),
          maxDebtPerUnitCollateral: new BigNumber(ilk.spot),
          debtCeiling: new BigNumber(ilk.line),
          debtFloor: new BigNumber(ilk.dust),
        }
      : undefined,
}

export function createVatIlks$(
  connectedContext$: Observable<ContextConnected>,
  ilk: string,
): Observable<Ilk> {
  return connectedContext$.pipe(
    switchMap((context) => {
      return call(context, vatIlks)({ ilk })
    }),
    filterNullish(),
  )
}
