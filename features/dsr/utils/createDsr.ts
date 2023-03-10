import BigNumber from 'bignumber.js'
import { Context, EveryBlockFunction$ } from 'blockchain/network'
import { DsrEvent } from 'features/dsr/helpers/dsrHistory'
import { Loadable, loadablifyLight } from 'helpers/loadable'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { DsrPot, dsrPot$, DsrPotKind } from '../helpers/dsrPot'

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
