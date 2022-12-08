import BigNumber from 'bignumber.js'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { ContextConnected, EveryBlockFunction$ } from 'blockchain/network'
import { DsrPot, dsrPot$, DsrPotKind } from '../helpers/dsrPot'
import { Loadable, loadablifyLight } from 'helpers/loadable'

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
  context$: Observable<ContextConnected>,
  everyBlock$: EveryBlockFunction$, // TODO: no need for 2 everyBlocks
  onEveryBlock$: Observable<number>,
  potDsr$: Observable<BigNumber>,
  potChi$: Observable<BigNumber>,
): Observable<Dsr> {
  return context$.pipe(
    switchMap((context) => {
   
      const dsr$ = loadablifyLight(
        dsrPot$(context.account, context, everyBlock$, potDsr$, potChi$),
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
