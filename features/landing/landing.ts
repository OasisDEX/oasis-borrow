import BigNumber from "bignumber.js";
import { Ilk } from "features/ilks/ilks";
import { combineLatest, Observable } from "rxjs";
import { distinctUntilChanged, map, shareReplay, switchMap } from "rxjs/operators";

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

export function createLanding$(ilks$: Observable<string[]>, ilk$: (ilk: string) => Observable<Ilk>): Observable<Landing> {

    return ilks$.pipe(
        switchMap(types => combineLatest(types.map(ilk => ilk$(ilk))).pipe(
            map(ilks => ilks.map(({ stabilityFee, debtCeiling, liquidationRatio, debtScalingFactor, normalizedIlkDebt }, i) => ({
                token: types[i].split('-')[0],
                ilk: types[i],
                daiAvailable: debtCeiling.minus(debtScalingFactor.times(normalizedIlkDebt)),
                stabilityFee,
                liquidationRatio,
            }))),
            map(rows => ({ rows }))
        )),
        distinctUntilChanged(),
        shareReplay(1),
    )
}