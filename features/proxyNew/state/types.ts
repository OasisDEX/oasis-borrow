import { Observable } from 'rxjs'

import { TxHelpers } from '../../../components/AppContext'
import { HasGasEstimation } from '../../../helpers/form'
import { createProxyStateMachine } from './machine'

export interface ProxyContext {
  readonly dependencies: {
    readonly txHelper: TxHelpers
    readonly proxyAddress$: Observable<string | undefined>
    readonly getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>
    readonly safeConfirmations: number
  }

  gasData?: HasGasEstimation
  txHash?: string
  txError?: string
  proxyConfirmations?: number
  proxyAddress?: string
}

export type ProxyEvent =
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

export type ProxyObservableService = (
  context: ProxyContext,
  event: ProxyEvent,
) => Observable<ProxyEvent>

export type ProxyStateMachine = ReturnType<typeof createProxyStateMachine>
export type ProxyStateMachineState = ProxyStateMachine['initialState']

export interface ProxyCreatingResult {
  proxyAddress: string
}
