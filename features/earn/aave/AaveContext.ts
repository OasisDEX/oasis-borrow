import { getGasEstimation$, getOpenProxyStateMachine$ } from 'features/proxyNew/pipelines'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { distinctUntilKeyChanged, switchMap } from 'rxjs/operators'

import { TokenBalances } from '../../../blockchain/tokens'
import { AppContext } from '../../../components/AppContext'
import { getManageAaveStateMachine$ } from './manage/state/getManageAaveStateMachine'
import { getManageAavePositionStateMachineServices } from './manage/state/services'
import {
  getManageAaveParametersStateMachine$,
  getManageAaveParametersStateMachineServices$,
} from './manage/transaction'
import { getManageAaveTransactionMachine } from './manage/transaction/getTransactionMachine'
import { getOpenAaveStateMachine$ } from './open/state/getOpenAaveStateMachine'
import { getOpenAavePositionStateMachineServices } from './open/state/services'
import {
  getOpenAaveParametersStateMachine$,
  getOpenAaveParametersStateMachineServices$,
} from './open/transaction'
import { getOpenAaveTransactionMachine } from './open/transaction/getTransactionMachine'

export function setupAaveContext({
  userSettings$,
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
    userSettings$,
  )

  const manageAaveParametersStateMachineServices$ = getManageAaveParametersStateMachineServices$(
    contextForAddress$,
    txHelpers$,
    gasEstimation$,
    userSettings$,
  )

  const openAaveParametersStateMachine$ = getOpenAaveParametersStateMachine$(
    openAaveParametersStateMachineServices$,
  )

  const manageAaveParametersStateMachine$ = getManageAaveParametersStateMachine$(
    manageAaveParametersStateMachineServices$,
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

  const manageAaveStateMachineServices = getManageAavePositionStateMachineServices(
    contextForAddress$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
  )

  const transactionMachine = getOpenAaveTransactionMachine(txHelpers$, contextForAddress$)
  const manageTransactionMachine = getManageAaveTransactionMachine(txHelpers$, contextForAddress$)

  const aaveStateMachine$ = getOpenAaveStateMachine$(
    openAaveStateMachineServices,
    openAaveParametersStateMachine$,
    proxyStateMachine$,
    transactionMachine,
  )

  const aaveManageStateMachine$ = getManageAaveStateMachine$(
    manageAaveStateMachineServices,
    manageAaveParametersStateMachine$,
    proxyStateMachine$,
    manageTransactionMachine,
  )

  return {
    aaveStateMachine$,
    aaveManageStateMachine$,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
