import BigNumber from 'bignumber.js'
import { CatIlk, catIlk } from 'blockchain/calls/cat'
import { JugIlk, jugIlk } from 'blockchain/calls/jug'
import { CallObservable } from 'blockchain/calls/observe'
import { SpotIlk, spotIlk } from 'blockchain/calls/spot'
import { VatIlk, vatIlk } from 'blockchain/calls/vat'
import { Context } from 'blockchain/network'
import { zero } from 'helpers/zero'
import { of } from 'rxjs'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { TokenBalances } from './tokens'

export function createIlks$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(
    map((context) => Object.keys(context.joins).filter((join) => join !== 'DAI' && join !== 'SAI')),
  )
}

interface DerivedIlkData {
  token: string
  ilk: string
  ilkDebt: BigNumber
  ilkDebtAvailable: BigNumber
}
export type IlkData = VatIlk & SpotIlk & JugIlk & CatIlk & DerivedIlkData

export function createIlkData$(
  vatIlks$: CallObservable<typeof vatIlk>,
  spotIlks$: CallObservable<typeof spotIlk>,
  jugIlks$: CallObservable<typeof jugIlk>,
  catIlks$: CallObservable<typeof catIlk>,
  ilkToToken$: Observable<(ilk: string) => string>,
  ilk: string,
): Observable<IlkData> {
  return combineLatest(
    vatIlks$(ilk),
    spotIlks$(ilk),
    jugIlks$(ilk),
    catIlks$(ilk),
    ilkToToken$,
  ).pipe(
    switchMap(
      ([
        { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
        { priceFeedAddress, liquidationRatio },
        { stabilityFee, feeLastLevied },
        { liquidatorAddress, liquidationPenalty, maxAuctionLotSize },
        ilkToToken,
      ]) =>
        of({
          normalizedIlkDebt,
          debtScalingFactor,
          maxDebtPerUnitCollateral,
          debtCeiling,
          debtFloor,
          priceFeedAddress,
          liquidationRatio,
          stabilityFee,
          feeLastLevied,
          liquidatorAddress,
          liquidationPenalty,
          maxAuctionLotSize,
          token: ilkToToken(ilk),
          ilk,
          ilkDebt: debtScalingFactor
            .times(normalizedIlkDebt)
            .decimalPlaces(18, BigNumber.ROUND_DOWN),
          ilkDebtAvailable: BigNumber.max(
            debtCeiling
              .minus(debtScalingFactor.times(normalizedIlkDebt))
              .decimalPlaces(18, BigNumber.ROUND_DOWN),
            zero,
          ),
        }),
    ),
  )
}

export type IlkDataList = IlkData[]

export function createIlkDataList$(
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
): Observable<IlkDataList> {
  return ilks$.pipe(
    switchMap((ilks) => combineLatest(ilks.map((ilk) => ilkData$(ilk)))),
    distinctUntilChanged(),
    shareReplay(1),
  )
}

export interface IlkWithBalance extends IlkData {
  balance?: BigNumber
  balancePriceInUsd?: BigNumber
}

export function createIlkDataListWithBalances$(
  context: Observable<Context>,
  ilkDataList$: Observable<IlkDataList>,
  balances$: (address: string) => Observable<TokenBalances>,
): Observable<IlkWithBalance[]> {
  return context.pipe(
    switchMap((context) =>
      context.status === 'connected'
        ? combineLatest(ilkDataList$, balances$(context.account))
        : combineLatest(ilkDataList$, of({})),
    ),
    map(([ilkData, balances]) =>
      ilkData.map((ilk) =>
        ilk.token in balances
          ? {
              ...ilk,
              balance: balances[ilk.token].balance,
              balancePriceInUsd: balances[ilk.token].balance.times(balances[ilk.token].price),
            }
          : ilk,
      ),
    ),
  )
}
