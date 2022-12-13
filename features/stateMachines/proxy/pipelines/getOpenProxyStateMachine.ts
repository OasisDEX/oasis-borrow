import { Observable } from 'rxjs'

import { ContextConnected } from '../../../../blockchain/network'
import { TxHelpers } from '../../../../components/AppContext'
import { HasGasEstimation } from '../../../../helpers/form'
import { createProxyStateMachine, ProxyStateMachine } from '../state'

export function getOpenProxyStateMachine(
  contextConnected$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
): ProxyStateMachine {
  return createProxyStateMachine(txHelpers$, proxyAddress$, getGasEstimation$, contextConnected$)
}
