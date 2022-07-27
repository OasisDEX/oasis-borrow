import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'

import { TokenBalances } from '../../../../../blockchain/tokens'
import {
  ProxyActorRef,
  ProxyStateMachine,
} from '../../../../proxyNew/state/proxyStateMachine.types'
import { openAaveStateMachine } from './openAaveStateMachine'

export interface OpenAaveContext {
  readonly dependencies: {
    readonly tokenBalances$: Observable<TokenBalances>
    readonly proxyAddress$: Observable<string | undefined>
    readonly getProxyStateMachine: () => ProxyStateMachine
  }

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  amount?: BigNumber
  token?: string
  tokenPrice?: BigNumber
  auxiliaryAmount?: BigNumber
  proxyAddress?: string
  refProxyMachine?: ProxyActorRef
  vaultNumber?: BigNumber
  canGoToNext?: boolean
  txHash?: string
  confirmations?: number
  txError?: string
}

export type OpenAaveEvent =
  | {
      type: 'CONFIRM_DEPOSIT'
    }
  | { type: 'PROXY_ADDRESS_RECEIVED'; proxyAddress: string | undefined }
  | {
      type: 'CREATE_PROXY'
    }
  | {
      type: 'PROXY_CREATED'
      proxyAddress: string
    }
  | {
      type: 'SET_AMOUNT'
      amount: BigNumber
    }
  | {
      type: 'SET_BALANCE'
      balance: BigNumber
      tokenPrice: BigNumber
    }
  | {
      type: 'POSITION_OPENED'
    }
  | {
      type: 'START_CREATING_POSITION'
    }
  | {
      type: 'TRANSACTION_WAITING_FOR_APPROVAL'
    }
  | {
      type: 'TRANSACTION_IN_PROGRESS'
      txHash: string
    }
  | {
      type: 'TRANSACTION_SUCCESS'
      vaultNumber: BigNumber
    }
  | {
      type: 'TRANSACTION_CONFIRMED'
      confirmations: number
    }
  | {
      type: 'TRANSACTION_FAILURE'
      txError?: string
    }

type OpenAaveStage =
  | 'editing'
  | 'proxyCreating'
  | 'reviewing'
  | 'txWaitingForConfirmation'
  | 'txWaitingForApproval'
  | 'txInProgress'
  | 'txFailure'
  | 'txSuccess'

export interface OpenAaveState {
  value: OpenAaveStage
  context: OpenAaveContext
}

export type OpenAaveObservableService = (
  context: OpenAaveContext,
  event: OpenAaveEvent,
) => Observable<OpenAaveEvent>

export type OpenAaveStateMachine = ReturnType<typeof openAaveStateMachine>
export type OpenAaveStateMachineState = OpenAaveStateMachine['initialState']
