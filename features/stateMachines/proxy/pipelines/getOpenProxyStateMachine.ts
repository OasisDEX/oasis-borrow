import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { createProxyStateMachine, ProxyStateMachine } from 'features/stateMachines/proxy/state'
import { HasGasEstimation } from 'helpers/form'
import { Observable } from 'rxjs'

export function getOpenProxyStateMachine(
  contextConnected$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
): ProxyStateMachine {
  return createProxyStateMachine(txHelpers$, proxyAddress$, getGasEstimation$, contextConnected$)
}
