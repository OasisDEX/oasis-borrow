import { getGasEstimation$, getOpenProxyStateMachine$ } from 'features/proxyNew/pipelines'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { distinctUntilKeyChanged, switchMap } from 'rxjs/operators'

import { TokenBalances } from '../../../blockchain/tokens'
import { AppContext } from '../../../components/AppContext'
import { getOpenAaveStateMachine$ } from './open/state/getOpenAaveStateMachine'
import { getOpenAavePositionStateMachineServices } from './open/state/services'
import {
  getOpenAaveParametersStateMachine$,
  getOpenAaveParametersStateMachineServices$,
} from './open/transaction'
import { getOpenAaveTransactionMachine } from './open/transaction/getTransactionMachine'

export function setupAaveContext({
  connectedContext$,
  proxyAddress$,
  txHelpers$,
  gasPrice$,
  daiEthTokenPrice$,
  accountBalances$,
}: AppContext) {
  const contextForAddress$ = connectedContext$.pipe(distinctUntilKeyChanged('account'))
  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)
  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const tokenBalances$: Observable<TokenBalances> = contextForAddress$.pipe(
    switchMap(({ account }) => accountBalances$(account)),
  )

  const openAaveParametersStateMachineServices$ = getOpenAaveParametersStateMachineServices$(
    contextForAddress$,
    txHelpers$,
    gasEstimation$,
  )

  const openAaveParametersStateMachine$ = getOpenAaveParametersStateMachine$(
    openAaveParametersStateMachineServices$,
  )

  const proxyStateMachine$ = getOpenProxyStateMachine$(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )

  const openAaveStateMachineServices = getOpenAavePositionStateMachineServices(
    contextForAddress$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
  )

  const transactionMachine = getOpenAaveTransactionMachine(txHelpers$, contextForAddress$)

  const aaveStateMachine$ = getOpenAaveStateMachine$(
    openAaveStateMachineServices,
    openAaveParametersStateMachine$,
    proxyStateMachine$,
    transactionMachine,
  )

  return {
    aaveStateMachine$,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
