import type { ContextConnected } from 'blockchain/network'
import type { ProxyStateMachine } from 'features/stateMachines/proxy/state'
import { createProxyStateMachine } from 'features/stateMachines/proxy/state'
import type { TxHelpers } from 'helpers/context/types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation'
import type { Observable } from 'rxjs'

export function getOpenProxyStateMachine(
  contextConnected$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
): ProxyStateMachine {
  return createProxyStateMachine(txHelpers$, proxyAddress$, getGasEstimation$, contextConnected$)
}
