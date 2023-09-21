import type { ContextConnected } from 'blockchain/network.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import type { Observable } from 'rxjs'

import type { createProxyStateMachine } from './machine'

export interface ProxyContext {
  readonly dependencies: {
    readonly txHelpers$: Observable<TxHelpers>
    readonly proxyAddress$: Observable<string | undefined>
    readonly getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>
    readonly context$: Observable<ContextConnected>
  }

  contextConnected?: ContextConnected
  txHelpers?: TxHelpers
  gasData: HasGasEstimation
  txHash?: string
  txError?: string
  proxyConfirmations?: number
  proxyAddress?: string
}

export type ProxyResultEvent =
  | { type: 'PROXY_CREATED'; connectedProxyAddress: string }
  | { type: 'PROXY_FAILED' }

export type ProxyEvent =
  | ProxyResultEvent
  | {
      readonly type: 'START'
    }
  | {
      readonly type: 'WAITING_FOR_APPROVAL'
    }
  | {
      readonly type: 'IN_PROGRESS'
      readonly proxyTxHash: string
    }
  | {
      readonly type: 'FAILURE'
      readonly txError?: string
    }
  | {
      readonly type: 'CONFIRMED'
      readonly proxyConfirmations?: number
    }
  | {
      readonly type: 'SUCCESS'
      readonly proxyAddress: string
    }
  | {
      readonly type: 'RETRY'
    }
  | {
      readonly type: 'GAS_COST_ESTIMATION'
      readonly gasData: HasGasEstimation
    }
  | { type: 'CONNECTED_CONTEXT_CHANGED'; contextConnected: ContextConnected }
  | { type: 'TX_HELPERS_CHANGED'; txHelpers: TxHelpers }

export type ProxyObservableService = (
  context: ProxyContext,
  event: ProxyEvent,
) => Observable<ProxyEvent>

export type ProxyStateMachine = ReturnType<typeof createProxyStateMachine>
export type ProxyStateMachineState = ProxyStateMachine['initialState']
