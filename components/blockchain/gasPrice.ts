import { BigNumber } from 'bignumber.js'
import { Context } from 'components/blockchain/network'
import { bindNodeCallback, combineLatest, forkJoin, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

export type GasPrice$ = Observable<BigNumber>

export function createGasPrice$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
): GasPrice$ {
  return combineLatest(onEveryBlock$, context$).pipe(
    switchMap(([, { web3 }]) => bindNodeCallback(web3.eth.getGasPrice)()),
    map((x) => new BigNumber(x)),
    distinctUntilChanged((x: BigNumber, y: BigNumber) => x.eq(y)),
    shareReplay(1),
  )
}
