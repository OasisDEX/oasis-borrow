import { getGasEstimation$, getOpenProxyStateMachine$ } from 'features/proxyNew/pipelines'
import { GraphQLClient } from 'graphql-request'
import moment from 'moment'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { distinctUntilKeyChanged, map, switchMap } from 'rxjs/operators'

import { TokenBalances } from '../../../blockchain/tokens'
import { AppContext } from '../../../components/AppContext'
import { getManageAaveStateMachine$ } from './manage/state/getManageAaveStateMachine'
import { getManageAavePositionStateMachineServices } from './manage/state/services'
import {
  getManageAaveParametersStateMachine$,
  getManageAaveParametersStateMachineServices$,
} from './manage/transaction'
import { getManageAaveTransactionMachine } from './manage/transaction/getTransactionMachine'
import { getSthEthSimulationMachine } from './open/components/simulate/services/getSthEthSimulationMachine'
import { getAaveStEthYield } from './open/components/simulate/services/stEthYield'
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

  const graphQLClient$ = contextForAddress$.pipe(
    distinctUntilKeyChanged('cacheApi'),
    map(({ cacheApi }) => new GraphQLClient(cacheApi)),
  )

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

  const aaveSthEthYields = curry(getAaveStEthYield)(graphQLClient$, moment())

  // TODO: Should be cached ?
  // TODO: Check if delay and debounce works well

  const simulationMachine = getSthEthSimulationMachine(aaveSthEthYields)

  const aaveStateMachine$ = getOpenAaveStateMachine$(
    openAaveStateMachineServices,
    openAaveParametersStateMachine$,
    proxyStateMachine$,
    transactionMachine,
    simulationMachine,
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
