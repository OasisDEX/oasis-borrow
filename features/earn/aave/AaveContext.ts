import { getGasEstimation$, getOpenProxyStateMachine$ } from '@oasis-borrow/proxy/pipelines'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { distinctUntilKeyChanged, switchMap } from 'rxjs/operators'

import { AppContext } from '../../../components/AppContext'
import { getOpenAaveStateMachine } from './pipelines/getOpenAaveStateMachine'
import {
  getPreTransactionMachine$,
  getPreTransactionMachineServices$,
} from './transaction/getPreTransactionMachineServices'

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

  const preTransactionMachineServices$ = getPreTransactionMachineServices$(
    txHelpers$,
    gasEstimation$,
  )

  const preTransactionMachine$ = getPreTransactionMachine$(preTransactionMachineServices$)

  const proxyStateMachine$ = getOpenProxyStateMachine$(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )

  const aaveStateMachine$ = getOpenAaveStateMachine(
    txHelpers$,
    contextForAddress$,
    accountBalances$,
    proxyForAccount$,
    proxyStateMachine$,
    gasEstimation$,
    preTransactionMachine$,
  )

  return {
    aaveStateMachine$,
    preTransactionMachine$,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
