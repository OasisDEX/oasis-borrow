import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ContextConnected } from '../../../../blockchain/network'
import { TokenBalances } from '../../../../blockchain/tokens'
import { ProxyStateMachine } from '../../../proxyNew/state/proxyStateMachine.types'
import { openAaveStateMachine } from '../open/state/openAaveStateMachine'
import { OpenAaveStateMachine } from '../open/state/openAaveStateMachine.types'

export function getOpenAaveStateMachine(
  context$: Observable<ContextConnected>,
  accountBalances$: (address: string) => Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  getProxyStateMachine$: Observable<ProxyStateMachine>,
): Observable<OpenAaveStateMachine> {
  return combineLatest(context$, getProxyStateMachine$).pipe(
    map(([{ account }, proxyStateMachine]) =>
      openAaveStateMachine(accountBalances$(account), proxyAddress$, () => proxyStateMachine),
    ),
  )
}
