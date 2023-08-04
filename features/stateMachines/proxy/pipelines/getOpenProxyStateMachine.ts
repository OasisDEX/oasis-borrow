import { ContextConnected } from 'blockchain/network'
import { createProxyStateMachine, ProxyStateMachine } from 'features/stateMachines/proxy/state'
import { TxHelpers } from 'helpers/context/types'
import { HasGasEstimation } from 'helpers/context/types'
import { Observable } from 'rxjs'

export function getOpenProxyStateMachine(
  contextConnected$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
): ProxyStateMachine {
  return createProxyStateMachine(txHelpers$, proxyAddress$, getGasEstimation$, contextConnected$)
}
