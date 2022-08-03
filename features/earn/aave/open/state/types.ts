import { OpenPositionResult } from '@oasis-borrow/aave'
import { ProxyStateMachine } from '@oasis-borrow/proxy/state'
import { useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'
import { AnyStateMachine, Receiver, Sender } from 'xstate'
import { ActorRefFrom } from 'xstate/lib/types'

import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { HasGasEstimation } from '../../../../../helpers/form'
import { PreTransactionSequenceMachineType } from '../../transaction/preTransactionSequenceMachine'
import { createOpenAaveStateMachine } from './machine'

export interface OpenAaveContext {
  readonly dependencies: {
    readonly txHelper: TxHelpers
    getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>
    readonly tokenBalances$: Observable<TokenBalances>
    readonly proxyAddress$: Observable<string | undefined>
    readonly proxyStateMachineCreator: () => ProxyStateMachine
  }

  refTransactionHelper?: ActorRefFrom<PreTransactionSequenceMachineType>

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  amount?: BigNumber
  multiply?: number
  token?: string
  tokenPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  proxyAddress?: string
  vaultNumber?: BigNumber
  canGoToNext?: boolean
  txHash?: string
  confirmations?: number
  txError?: string
  proxyStateMachine?: ProxyStateMachine
  transactionParameters?: OpenPositionResult

  gasData?: HasGasEstimation
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

export type OpenAaveObservableService = (
  context: OpenAaveContext,
  event: OpenAaveEvent,
) => Observable<OpenAaveEvent>

export type OpenAaveCallbackService = (
  context: OpenAaveContext,
  event: OpenAaveEvent,
) => (callback: Sender<OpenAaveEvent>, onReceive: Receiver<OpenAaveEvent>) => void

export type OpenAaveMachineService = (context: OpenAaveContext) => AnyStateMachine

function useOpenAaveStateMachine(machine: OpenAaveStateMachine) {
  return useMachine(machine)
}

export type OpenAaveStateMachine = ReturnType<typeof createOpenAaveStateMachine>
export type OpenAaveStateMachineInstance = ReturnType<typeof useOpenAaveStateMachine>
export type OpenAaveStateMachineState = OpenAaveStateMachine['initialState']
