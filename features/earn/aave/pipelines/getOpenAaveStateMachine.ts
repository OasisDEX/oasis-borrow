import { ProxyStateMachine } from '@oasis-borrow/proxy/state'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ContextConnected } from '../../../../blockchain/network'
import { TokenBalances } from '../../../../blockchain/tokens'
import { createOpenAaveStateMachine } from '../open/state/machine'
import { OpenAaveStateMachine } from '../open/state/types'

export function getOpenAaveStateMachine(
  context$: Observable<ContextConnected>,
  accountBalances$: (address: string) => Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  getProxyStateMachine$: Observable<ProxyStateMachine>,
): Observable<OpenAaveStateMachine> {
  return combineLatest(context$, getProxyStateMachine$).pipe(
    map(([{ account }, proxyStateMachine]) =>
      createOpenAaveStateMachine(accountBalances$(account), proxyAddress$, () => proxyStateMachine),
    ),
  )
}
