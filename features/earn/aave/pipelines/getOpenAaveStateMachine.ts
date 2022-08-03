import { ProxyStateMachine } from '@oasis-borrow/proxy/state'
import { combineLatest, Observable } from 'rxjs'
import { first, map, tap } from 'rxjs/operators'

import { ContextConnected } from '../../../../blockchain/network'
import { TokenBalances } from '../../../../blockchain/tokens'
import { TxHelpers } from '../../../../components/AppContext'
import { HasGasEstimation } from '../../../../helpers/form'
import { createOpenAaveStateMachine } from '../open/state/machine'
import { OpenAaveStateMachine } from '../open/state/types'
import { OpenAaveParametersStateMachineType } from '../open/transaction'

export function getOpenAaveStateMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  accountBalances$: (address: string) => Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  getProxyStateMachine$: Observable<ProxyStateMachine>,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
  preTransactionSequenceMachine$: Observable<OpenAaveParametersStateMachineType>,
): Observable<OpenAaveStateMachine> {
  return combineLatest(
    context$,
    getProxyStateMachine$,
    txHelpers$,
    preTransactionSequenceMachine$,
  ).pipe(
    first(),
    tap(([, , , machine]) => {
      console.log('machine', machine)
    }),
    map(([{ account }, proxyStateMachine, txHelpers, preTransactionSequenceMachine]) =>
      createOpenAaveStateMachine(
        txHelpers,
        accountBalances$(account),
        proxyAddress$,
        () => proxyStateMachine,
        getGasEstimation$,
        preTransactionSequenceMachine,
      ),
    ),
  )
}
