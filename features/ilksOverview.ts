import BigNumber from 'bignumber.js'
import { Ilk } from 'features/ilks/ilks'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

export interface IlkOverview {
  token: string
  ilk: string
  daiAvailable: BigNumber
  stabilityFee: BigNumber
  liquidationRatio: BigNumber
}

export function createIlkOverview$(
  ilkNames$: Observable<string[]>,
  ilk$: (ilk: string) => Observable<Ilk>,
): Observable<IlkOverview[]> {
  return ilkNames$.pipe(
    switchMap((ilkNames) =>
      combineLatest(ilkNames.map((ilk) => ilk$(ilk))).pipe(
        map((ilks) =>
          ilks.map(
            (
              { stabilityFee, debtCeiling, liquidationRatio, debtScalingFactor, normalizedIlkDebt },
              i,
            ) => ({
              token: ilkNames[i].split('-')[0],
              ilk: ilkNames[i],
              daiAvailable: debtCeiling.minus(debtScalingFactor.times(normalizedIlkDebt)),
              stabilityFee,
              liquidationRatio,
            }),
          ),
        ),
      ),
    ),
    distinctUntilChanged(),
    shareReplay(1),
  )
}
