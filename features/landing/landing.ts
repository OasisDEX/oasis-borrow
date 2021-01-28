import BigNumber from 'bignumber.js'
import { Ilk } from 'features/ilks/ilks'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

interface LandingRow {
  token: string
  ilk: string
  daiAvailable: BigNumber
  stabilityFee: BigNumber
  liquidationRatio: BigNumber
}

interface Landing {
  rows: LandingRow[]
}

export function createLanding$(
  ilkNames$: Observable<string[]>,
  ilk$: (ilk: string) => Observable<Ilk>,
): Observable<Landing> {
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
        map((rows) => ({ rows })),
      ),
    ),
    distinctUntilChanged(),
    shareReplay(1),
  )
}
