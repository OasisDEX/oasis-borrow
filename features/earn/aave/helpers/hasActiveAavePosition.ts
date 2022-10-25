import { Web3Context } from '@oasisdex/web3-context'
import { ContextConnected } from 'blockchain/network'
import { startWithDefault } from 'helpers/operators'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

type hasActiveAavePositionProps = boolean | string

export function hasActiveAavePosition(
  context$: Observable<Web3Context>,
  hasAavePosition$: (address: string) => Observable<boolean>,
): Observable<hasActiveAavePositionProps> {
  return context$.pipe(
    switchMap((context: ContextConnected) =>
      combineLatest(startWithDefault(hasAavePosition$(context.account), false)).pipe(
        map(([hasAavePosition]) => hasAavePosition && context.account),
      ),
    ),
  )
}
