import { ProxyStateMachine } from '@oasis-borrow/proxy/state'
import { useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'
import { AnyStateMachine } from 'xstate'

import { TokenBalances } from '../../../../../blockchain/tokens'
import { createOpenAaveStateMachine } from './machine'

export interface OpenAaveContext {
  readonly dependencies: {
    readonly tokenBalances$: Observable<TokenBalances>
    readonly proxyAddress$: Observable<string | undefined>
    readonly proxyStateMachineCreator: () => ProxyStateMachine
  }

  currentStep?: number
  totalSteps?: number
  tokenBalance?: BigNumber
  amount?: BigNumber
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

export type OpenAaveObservableService = (
  context: OpenAaveContext,
  event: OpenAaveEvent,
) => Observable<OpenAaveEvent>

export type OpenAaveMachineService = (context: OpenAaveContext) => AnyStateMachine

function useOpenAaveStateMachine(machine: OpenAaveStateMachine) {
  return useMachine(machine)
}

export type OpenAaveStateMachine = ReturnType<typeof createOpenAaveStateMachine>
export type OpenAaveStateMachineInstance = ReturnType<typeof useOpenAaveStateMachine>
export type OpenAaveStateMachineState = OpenAaveStateMachine['initialState']
