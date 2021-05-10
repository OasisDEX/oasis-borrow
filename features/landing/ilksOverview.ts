import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { zero } from 'helpers/zero'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

export interface IlkOverview {
  token: string
  ilk: string
  ilkDebtAvailable: BigNumber
  stabilityFee: BigNumber
  liquidationRatio: BigNumber
}

export function createIlkOverview$(
  ilkNames$: Observable<string[]>,
  ilk$: (ilk: string) => Observable<IlkData>,
  ilkToToken$: Observable<(ilk: string) => string>,
): Observable<IlkOverview[]> {
  return combineLatest(ilkNames$, ilkToToken$).pipe(
    switchMap(([ilkNames, ilkToToken]) =>
      combineLatest(ilkNames.map((ilk) => ilk$(ilk))).pipe(
        map((ilks) =>
          ilks.map(
            (
              { stabilityFee, debtCeiling, liquidationRatio, debtScalingFactor, normalizedIlkDebt },
              i,
            ) => ({
              token: ilkToToken(ilkNames[i]),
              ilk: ilkNames[i],
              ilkDebtAvailable: BigNumber.max(
                debtCeiling.minus(debtScalingFactor.times(normalizedIlkDebt)),
                zero,
              ),
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
