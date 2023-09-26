import type BigNumber from 'bignumber.js'
import type { Context, EveryBlockFunction$ } from 'blockchain/network.types'
import type { DsrEvent } from 'features/dsr/helpers/dsrHistory'
import type { DsrPot, DsrPotKind } from 'features/dsr/helpers/dsrPot'
import { dsrPot$ } from 'features/dsr/helpers/dsrPot'
import type { Loadable } from 'helpers/loadable'
import { loadablifyLight } from 'helpers/loadable'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'
import type { Dictionary } from 'ts-essentials'

export type PotKind = DsrPotKind

export type Pot = DsrPot

export interface Dsr {
  dai: BigNumber
  daiUSD: BigNumber
  daiAllowance: boolean
  eth: BigNumber
  ethUSD: BigNumber
  pots: Dictionary<Loadable<Pot>, PotKind>
  apy: Dictionary<BigNumber>
}

export function createDsr$(
  context$: Observable<Context>,
  everyBlock$: EveryBlockFunction$, // TODO: no need for 2 everyBlocks
  onEveryBlock$: Observable<number>,
  history$: Observable<DsrEvent[]>,
  potDsr$: Observable<BigNumber>,
  potChi$: Observable<BigNumber>,
  addressFromUrl: string,
): Observable<Dsr> {
  return context$.pipe(
    switchMap((context) => {
      const dsr$ = loadablifyLight(
        dsrPot$(addressFromUrl, context, everyBlock$, history$, potDsr$, potChi$),
        onEveryBlock$,
      )

      return combineLatest(dsr$).pipe(
        map(([dsr]) => ({
          pots: { dsr },
        })),
      )
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
