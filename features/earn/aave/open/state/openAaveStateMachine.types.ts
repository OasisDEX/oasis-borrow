import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'

import { TokenBalances } from '../../../../../blockchain/tokens'
import {
  ProxyActorRef,
  ProxyStateMachine,
} from '../../../../proxyNew/state/proxyStateMachine.types'
import { openAaveStateMachine } from './openAaveStateMachine'

export interface OpenAaveContext {
  readonly tokenBalances$: Observable<TokenBalances>
  readonly proxyAddress$: Observable<string | undefined>
  readonly getProxyStateMachine: () => ProxyStateMachine
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

interface DepositEvent {
  type: 'CONFIRM_DEPOSIT'
}

interface ProxyAddressReceivedEvent {
  type: 'PROXY_ADDRESS_RECEIVED'
  proxyAddress: string | undefined
}

interface CreateProxyEvent {
  type: 'CREATE_PROXY'
}

interface ProxyCreatedEvent {
  type: 'PROXY_CREATED'
  proxyAddress: string
}

interface SetAmountEvent {
  type: 'SET_AMOUNT'
  amount: BigNumber
}

interface SetBalanceEvent {
  type: 'SET_BALANCE'
  balance: BigNumber
  tokenPrice: BigNumber
}

interface PositionOpenedEvent {
  type: 'POSITION_OPENED'
}

interface StartCreatingPositionEvent {
  type: 'START_CREATING_POSITION'
}

interface TransactionWaitingForApprovalEvent {
  type: 'TRANSACTION_WAITING_FOR_APPROVAL'
}

interface TransactionInProgressEvent {
  type: 'TRANSACTION_IN_PROGRESS'
  txHash: string
}

interface TransactionSuccessEvent {
  type: 'TRANSACTION_SUCCESS'
  vaultNumber: BigNumber
}

interface TransactionConfirmedEvent {
  type: 'TRANSACTION_CONFIRMED'
  confirmations: number
}

interface TransactionFailureEvent {
  type: 'TRANSACTION_FAILURE'
  txError?: string
}

export type OpenAaveEvent =
  | DepositEvent
  | ProxyAddressReceivedEvent
  | CreateProxyEvent
  | ProxyCreatedEvent
  | SetAmountEvent
  | SetBalanceEvent
  | PositionOpenedEvent
  | StartCreatingPositionEvent
  | TransactionWaitingForApprovalEvent
  | TransactionInProgressEvent
  | TransactionSuccessEvent
  | TransactionConfirmedEvent
  | TransactionFailureEvent

const OPEN_AAVE_STAGES = [
  'editing',
  'proxyCreating',
  'reviewing',
  'txWaitingForConfirmation',
  'txWaitingForApproval',
  'txInProgress',
  'txFailure',
  'txSuccess',
] as const

type OpenAaveStage = typeof OPEN_AAVE_STAGES[number]

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
