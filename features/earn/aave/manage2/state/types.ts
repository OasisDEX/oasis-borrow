import { createManageAaveStateMachine } from '../state/machine'
import { ProxyStateMachine } from '../../../../proxyNew/state'
import { OpenAaveParametersStateMachineType } from '../../open/transaction'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { OpenAavePositionData } from '../../open/pipelines/openAavePosition'
import { ActorRefFrom } from 'xstate'
import BigNumber from 'bignumber.js'
import { OpenPositionResult } from '../../../../aave'
import { HasGasEstimation } from '../../../../../helpers/form'
import { OpenAaveStateMachine } from '../../open/state/types'

export interface ManageAaveContext {
  readonly dependencies: {
    readonly parametersStateMachine: ManageAaveParametersStateMachineType
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

export type ManageAaveEvent =
  | {
      readonly type: 'CONFIRM_DEPOSIT'
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

export type ManageAaveStateMachine = typeof createManageAaveStateMachine
export type ManageAaveStateMachineState = ManageAaveStateMachine['initialState']
