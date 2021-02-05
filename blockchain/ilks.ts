import { CatIlk, catIlk } from 'blockchain/calls/cat'
import { JugIlk, jugIlk } from 'blockchain/calls/jug'
import { CallObservable } from 'blockchain/calls/observe'
import { SpotIlk, spotIlk } from 'blockchain/calls/spot'
import { VatIlk, vatIlk } from 'blockchain/calls/vat'
import { of } from 'rxjs'
import { Context } from 'blockchain/network'
import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

export function createIlks$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(
    map((context) => Object.keys(context.joins).filter((join) => join !== 'DAI' && join !== 'SAI')),
  )
}

export type IlkData = VatIlk & SpotIlk & JugIlk & CatIlk

export function createIlkData$(
  vatIlks$: CallObservable<typeof vatIlk>,
  spotIlks$: CallObservable<typeof spotIlk>,
  jugIlks$: CallObservable<typeof jugIlk>,
  catIlks$: CallObservable<typeof catIlk>,
  ilk: string,
): Observable<IlkData> {
  return combineLatest(vatIlks$(ilk), spotIlks$(ilk), jugIlks$(ilk), catIlks$(ilk)).pipe(
    switchMap(
      ([
        { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
        { priceFeedAddress, liquidationRatio },
        { stabilityFee, feeLastLevied },
        { liquidatorAddress, liquidationPenalty, maxAuctionLotSize },
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
        }),
    ),
  )
}

export interface IlkDataSummary {
  token: string
  ilk: string
  daiAvailable: BigNumber
  stabilityFee: BigNumber
  liquidationRatio: BigNumber
  ilkDebt: BigNumber
}

export type IlkDataList = IlkDataSummary[]

export function createIlkDataList$(
  ilks$: Observable<string[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
): Observable<IlkDataList> {
  return ilks$.pipe(
    switchMap((ilks) =>
      combineLatest(ilks.map((ilk) => ilkData$(ilk))).pipe(
        map((ilkDataList) =>
          ilkDataList.map(
            (
              { stabilityFee, debtCeiling, liquidationRatio, debtScalingFactor, normalizedIlkDebt },
              i,
            ) => ({
              token: ilks[i].split('-')[0],
              ilk: ilks[i],
              daiAvailable: debtCeiling.minus(debtScalingFactor.times(normalizedIlkDebt)),
              stabilityFee,
              liquidationRatio,
              ilkDebt: normalizedIlkDebt.times(debtScalingFactor),
            }),
          ),
        ),
      ),
    ),
    distinctUntilChanged(),
    shareReplay(1),
  )
}
