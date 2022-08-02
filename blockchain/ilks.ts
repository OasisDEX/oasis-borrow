import BigNumber from 'bignumber.js'
import { DogIlk, dogIlk } from 'blockchain/calls/dog'
import { JugIlk, jugIlk } from 'blockchain/calls/jug'
import { CallObservable } from 'blockchain/calls/observe'
import { SpotIlk, spotIlk } from 'blockchain/calls/spot'
import { VatIlk, vatIlk } from 'blockchain/calls/vat'
import { Context } from 'blockchain/network'
import { one, zero } from 'helpers/zero'
import { of } from 'rxjs'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, retry, shareReplay, switchMap } from 'rxjs/operators'

export function createIlksSupportedOnNetwork$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(
    map((context) => Object.keys(context.joins).filter((join) => !['DAI', 'SAI'].includes(join))),
  )
}

interface DerivedIlkData {
  token: string
  ilk: string
  ilkDebt: BigNumber
  ilkDebtAvailable: BigNumber
  collateralizationDangerThreshold: BigNumber
  collateralizationWarningThreshold: BigNumber
}
export type IlkData = VatIlk & SpotIlk & JugIlk & DogIlk & DerivedIlkData

// TODO Go in some config somewhere?
export const COLLATERALIZATION_DANGER_OFFSET = new BigNumber('0.2') // 150% * 1.2 = 180%
export const COLLATERALIZATION_WARNING_OFFSET = new BigNumber('0.5') // 150% * 1.5 = 225%

export function createIlkData$(
  vatIlks$: CallObservable<typeof vatIlk>,
  spotIlks$: CallObservable<typeof spotIlk>,
  jugIlks$: CallObservable<typeof jugIlk>,
  dogIlks$: CallObservable<typeof dogIlk>,
  ilkToToken$: (ilk: string) => Observable<string>,
  ilk: string,
): Observable<IlkData> {
  return combineLatest(
    vatIlks$(ilk),
    spotIlks$(ilk),
    jugIlks$(ilk),
    dogIlks$(ilk),
    ilkToToken$(ilk),
  ).pipe(
    switchMap(
      ([
        { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
        { priceFeedAddress, liquidationRatio },
        { stabilityFee, feeLastLevied },
        { liquidatorAddress, liquidationPenalty },
        token,
      ]) => {
        const collateralizationDangerThreshold = liquidationRatio.times(
          COLLATERALIZATION_DANGER_OFFSET.plus(one),
        )
        const collateralizationWarningThreshold = liquidationRatio.times(
          COLLATERALIZATION_WARNING_OFFSET.plus(one),
        )

        return of({
          collateralizationDangerThreshold,
          collateralizationWarningThreshold,
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
          token,
          ilk,
          ilkDebt: normalizedIlkDebt
            .times(debtScalingFactor)
            .decimalPlaces(18, BigNumber.ROUND_DOWN),
          ilkDebtAvailable: BigNumber.max(
            debtCeiling
              .minus(debtScalingFactor.times(normalizedIlkDebt))
              .decimalPlaces(18, BigNumber.ROUND_DOWN),
            zero,
          ),
        })
      },
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
    retry(3),
    shareReplay(1),
  )
}

export interface IlkDataChange {
  kind: 'ilkData'
  ilkData: IlkData
}

export function createIlkDataChange$(
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
): Observable<IlkDataChange> {
  return ilkData$(ilk).pipe(map((ilkData) => ({ kind: 'ilkData', ilkData })))
}
