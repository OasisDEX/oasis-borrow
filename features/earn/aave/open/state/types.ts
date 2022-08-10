import { OpenPositionResult } from '@oasis-borrow/aave'
import { ProxyStateMachine } from '@oasis-borrow/proxy/state'
import { useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'
import { ActorRefFrom, AnyStateMachine } from 'xstate'

import { HasGasEstimation } from '../../../../../helpers/form'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
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

  transactionParameters?: OpenPositionResult
  estimatedGasPrice?: HasGasEstimation
}

export type OpenAaveEvent =
  | {
      readonly type: 'CONFIRM_DEPOSIT'
    }
  | {
      readonly type: 'PROXY_ADDRESS_RECEIVED'
      readonly proxyAddress: string | undefined
    }
  | {
      readonly type: 'CREATE_PROXY'
    }
  | {
      readonly type: 'PROXY_CREATED'
      readonly proxyAddress: string
    }
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
  | {
      readonly type: 'TRANSACTION_WAITING_FOR_APPROVAL'
    }
  | {
      readonly type: 'TRANSACTION_IN_PROGRESS'
      readonly txHash: string
    }
  | {
      readonly type: 'TRANSACTION_SUCCESS'
      readonly vaultNumber: BigNumber
    }
  | {
      readonly type: 'TRANSACTION_CONFIRMED'
      readonly confirmations: number
    }
  | {
      readonly type: 'TRANSACTION_FAILURE'
      readonly txError?: string
    }
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
  | {
      readonly type: 'GAS_COST_ESTIMATION'
      readonly gasData: HasGasEstimation
    }
  | {
      readonly type: 'BACK_TO_EDITING'
    }
  | {
      readonly type: 'RETRY'
    }
  | {
      readonly type: 'xstate.update' // https://xstate.js.org/docs/guides/actors.html#sending-updates
    }
  | {
      readonly type: 'done.invoke.transaction'
    }
  | {
      readonly type: 'error.platform.transaction'
    }
  | {
      readonly type: 'done.invoke.proxy'
    }
  | {
      readonly type: 'error.platform.proxy'
    }

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
