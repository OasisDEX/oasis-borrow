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
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import { OpenAaveParametersStateMachineType } from '../transaction'
import { createOpenAaveStateMachine } from './machine'

export interface OpenAaveContext {
  readonly dependencies: {
    readonly proxyStateMachine: ProxyStateMachine
    readonly parametersStateMachine: OpenAaveParametersStateMachineType
    readonly transactionStateMachine: TransactionStateMachine<OpenAavePositionData>
  }
  multiply: number
  token: string

  refProxyStateMachine?: ActorRefFrom<ProxyStateMachine>
  refParametersStateMachine?: ActorRefFrom<OpenAaveParametersStateMachineType>
  refTransactionStateMachine?: ActorRefFrom<TransactionStateMachine<OpenAavePositionData>>

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  amount?: BigNumber
  tokenPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  proxyAddress?: string
  vaultNumber?: BigNumber
  strategyName?: string

  transactionParameters?: OpenPositionResult
  estimatedGasPrice?: HasGasEstimation
}

export type OpenAaveMachineEvents =
  | {
      readonly type: 'SET_AMOUNT'
      readonly amount: BigNumber
    }
  | {
      readonly type: 'SET_BALANCE'
      readonly balance: BigNumber
      readonly tokenPrice: BigNumber
    }
  | {
      readonly type: 'POSITION_OPENED'
    }
  | {
      readonly type: 'START_CREATING_POSITION'
    }

export type OpenAaveTransactionEvents =
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

export type OpenAaveEvent =
  | ProxyMachineEvents
  | TransactionMachineEvents
  | CommonMachineEvents
  | OpenAaveMachineEvents
  | OpenAaveTransactionEvents

export type OpenAaveObservableService = (
  context: OpenAaveContext,
  event: OpenAaveEvent,
) => Observable<OpenAaveEvent>

export type OpenAaveInvokeMachineService = (context: OpenAaveContext) => AnyStateMachine

function useOpenAaveStateMachine(machine: OpenAaveStateMachine) {
  return useMachine(machine)
}

export type OpenAaveStateMachine = typeof createOpenAaveStateMachine
export type OpenAaveStateMachineInstance = ReturnType<typeof useOpenAaveStateMachine>
export type OpenAaveStateMachineState = OpenAaveStateMachine['initialState']
