import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { distinctUntilKeyChanged, switchMap } from 'rxjs/operators'

import { AppContext } from '../../../components/AppContext'
import { getGasEstimation$ } from '../../proxyNew/pipelines/getGasEstimation'
import { getOpenProxyStateMachine$ } from '../../proxyNew/pipelines/getOpenProxyStateMachine'
import { getOpenAaveStateMachine } from './pipelines/getOpenAaveStateMachine'

export function setupAaveContext({
  connectedContext$,
  proxyAddress$,
  txHelpers$,
  gasPrice$,
  daiEthTokenPrice$,
  accountBalances$,
}: AppContext) {
  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)

  const contextForAddress$ = connectedContext$.pipe(distinctUntilKeyChanged('account'))

  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const proxyStateMachine$ = getOpenProxyStateMachine$(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )

  const aaveStateMachine$ = getOpenAaveStateMachine(
    contextForAddress$,
    accountBalances$,
    proxyForAccount$,
    proxyStateMachine$,
  )

  return {
    aaveStateMachine$,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
