import BigNumber from 'bignumber.js'
import { IlkData } from 'components/blockchain/ilks'
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
  ilks$: Observable<string[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
): Observable<Landing> {
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
