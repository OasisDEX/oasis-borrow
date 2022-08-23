import { useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'
import { ActorRefFrom, AnyStateMachine } from 'xstate'

import { HasGasEstimation } from '../../../../../helpers/form'
import { OpenPositionResult } from '../../../../aave'
import { ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import {
  CommonMachineEvents,
  ProxyMachineEvents,
  TransactionMachineEvents,
} from '../../common/state/types'
import { ManageAavePositionData } from '../pipelines/manageAavePosition'
import { ManageAaveParametersStateMachineType } from '../transaction'
import { createManageAaveStateMachine } from './machine'

export interface ManageAaveContext {
  readonly dependencies: {
    readonly proxyStateMachine: ProxyStateMachine
    readonly parametersStateMachine: ManageAaveParametersStateMachineType
    readonly transactionStateMachine: TransactionStateMachine<ManageAavePositionData>
  }
  token: string

  refProxyStateMachine?: ActorRefFrom<ProxyStateMachine>
  refParametersStateMachine?: ActorRefFrom<ManageAaveParametersStateMachineType>
  refTransactionStateMachine?: ActorRefFrom<TransactionStateMachine<ManageAavePositionData>>

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  amount?: BigNumber
  tokenPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  proxyAddress?: string
  vaultNumber?: BigNumber
  strategyName?: string
  multiply: number

  transactionParameters?: OpenPositionResult
  estimatedGasPrice?: HasGasEstimation
}

export type ManageAaveMachineEvents =
  | {
      readonly type: 'POSITION_CLOSED'
    }
  | {
      readonly type: 'START_ADJUSTING_POSITION'
    }
  | {
      readonly type: 'START_CLOSING_POSITION'
    }

export type ManageAaveTransactionEvents =
  | {
      readonly type: 'TRANSACTION_PARAMETERS_RECEIVED'
      readonly parameters: OpenPositionResult
    }
  | {
      readonly type: 'TRANSACTION_PARAMETERS_CHANGED'
      readonly amount: BigNumber
      readonly multiply: number
      readonly token: string
    }

export type ManageAaveEvent =
  | ProxyMachineEvents
  | TransactionMachineEvents
  | CommonMachineEvents
  | ManageAaveMachineEvents
  | ManageAaveTransactionEvents

export type ManageAaveObservableService = (
  context: ManageAaveContext,
  event: ManageAaveEvent,
) => Observable<ManageAaveEvent>

export type ManageAaveInvokeMachineService = (context: ManageAaveContext) => AnyStateMachine

function useManageAaveStateMachine(machine: ManageAaveStateMachine) {
  return useMachine(machine)
}

export type ManageAaveStateMachine = typeof createManageAaveStateMachine
export type ManageAaveStateMachineInstance = ReturnType<typeof useManageAaveStateMachine>
export type ManageAaveStateMachineState = ManageAaveStateMachine['initialState']
