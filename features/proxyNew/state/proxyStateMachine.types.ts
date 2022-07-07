import { Observable } from 'rxjs'
import { spawn } from 'xstate'

import { TxHelpers } from '../../../components/AppContext'
import { HasGasEstimation } from '../../../helpers/form'
import { createProxyStateMachine } from './proxyStateMachine'

export interface ProxyContext {
  readonly txHelper: TxHelpers
  readonly proxyAddress$: Observable<string | undefined>
  readonly getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>
  readonly safeConfirmations: number
  gasData?: HasGasEstimation
  txHash?: string
  txError?: string
  proxyConfirmations?: number
  proxyAddress?: string
}

export type ProxyEvent =
  | {
      type: 'START'
    }
  | {
      type: 'WAITING_FOR_APPROVAL'
    }
  | {
      type: 'IN_PROGRESS'
      proxyTxHash: string
    }
  | {
      type: 'FAILURE'
      txError?: string
    }
  | {
      type: 'CONFIRMED'
      proxyConfirmations?: number
    }
  | {
      type: 'SUCCESS'
      proxyAddress: string
    }
  | {
      type: 'RETRY'
    }
  | {
      type: 'GAS_COST_ESTIMATION'
      gasData: HasGasEstimation
    }

export const PROXY_STAGES = [
  'proxyIdle',
  'proxyWaitingForApproval',
  'proxyInProgress',
  'proxyFailure',
  'proxySuccess',
] as const

export type ProxyStages = typeof PROXY_STAGES[number]

function spawnProxy<S extends ProxyStateMachine>(s: S) {
  return spawn(s)
}

export type ProxyObservableService = (
  context: ProxyContext,
  event: ProxyEvent,
) => Observable<ProxyEvent>
export type ProxyStateMachine = ReturnType<typeof createProxyStateMachine>
export type ProxySateMachineState = ReturnType<typeof createProxyStateMachine>['initialState']
export type ProxyActorRef = ReturnType<typeof spawnProxy>

export interface ProxyState {
  value: ProxyStages
  context: ProxyContext
}
