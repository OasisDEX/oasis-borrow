import { TxMeta } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import {
  TransactionStateMachine,
  TransactionStateMachineResultEvents,
} from 'features/stateMachines/transaction'
import { ActorRefFrom, assign, createMachine, sendParent, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'

export type AllowanceType = 'unlimited' | 'custom' | 'minimum'
export interface AllowanceStateMachineContext {
  token: string
  spender: string
  amount?: BigNumber
  minimumAmount: BigNumber

  allowanceType: AllowanceType
  error?: string | unknown
  refTransactionMachine?: ActorRefFrom<TransactionStateMachine<AllowanceTxMeta>>
}

function getEffectiveAllowanceAmount(context: AllowanceStateMachineContext) {
  if (context.allowanceType === 'unlimited') {
    return maxUint256
  }
  if (context.allowanceType === 'minimum') {
    return context.minimumAmount
  }
  return context.amount!
}

function isAllowanceValid(context: AllowanceStateMachineContext) {
  if (context.allowanceType === 'custom') {
    return context.amount?.gte(context.minimumAmount) ?? false
  }
  return true
}

export interface AllowanceTxMeta extends TxMeta {
  kind: TxMetaKind.approve
  token: string
  spender: string
  amount: BigNumber
}

export type AllowanceStateMachineResponseEvent = {
  type: 'ALLOWANCE_SUCCESS'
  amount: BigNumber
  token: string
  spender: string
}

export type AllowanceStateMachineEvent =
  | AllowanceStateMachineResponseEvent
  | { type: 'NEXT_STEP' }
  | { type: 'RETRY' }
  | { type: 'BACK' }
  | { type: 'CONTINUE' }
  | { type: 'SET_ALLOWANCE'; amount?: BigNumber; allowanceType: AllowanceType }
  | {
      type: 'SET_ALLOWANCE_CONTEXT' | 'RESET_ALLOWANCE_CONTEXT'
      minimumAmount: BigNumber
      token: string
      spender: string
      allowanceType: AllowanceType
    }
  | TransactionStateMachineResultEvents

export function createAllowanceStateMachine(
  transactionStateMachine: (
    parameters: AllowanceTxMeta,
  ) => TransactionStateMachine<AllowanceTxMeta>,
) {
  return createMachine(
    {
      tsTypes: {} as import('./createAllowanceStateMachine.typegen').Typegen0,
      preserveActionOrder: true,
      predictableActionArguments: true,
      schema: {
        context: {} as AllowanceStateMachineContext,
        events: {} as AllowanceStateMachineEvent,
      },
      id: 'allowance',
      initial: 'idle',
      states: {
        idle: {
          on: {
            NEXT_STEP: {
              cond: 'isAllowanceValid',
              target: 'txInProgress',
            },
            SET_ALLOWANCE: {
              actions: ['updateContext'],
            },
            SET_ALLOWANCE_CONTEXT: {
              actions: ['updateContext'],
            },
          },
        },
        txInProgress: {
          entry: ['spawnTransactionMachine'],
          on: {
            TRANSACTION_COMPLETED: {
              target: 'txSuccess',
            },
            TRANSACTION_FAILED: {
              target: 'txFailure',
              actions: ['updateContext'],
            },
          },
        },
        txFailure: {
          entry: ['killTransactionMachine'],
          on: {
            RETRY: {
              target: 'txInProgress',
            },
            BACK: {
              target: 'idle',
            },
          },
        },
        txSuccess: {
          entry: ['killTransactionMachine'],
          on: {
            CONTINUE: {
              actions: ['sendAllowanceSetEvent'],
            },
          },
        },
      },
      on: {
        RESET_ALLOWANCE_CONTEXT: {
          actions: ['updateContext'],
          target: 'idle',
        },
      },
    },
    {
      guards: {
        isAllowanceValid,
      },
      actions: {
        updateContext: assign((context, event) => ({ ...event })),
        spawnTransactionMachine: assign((context) => ({
          refTransactionMachine: spawn(
            transactionStateMachine({
              amount: getEffectiveAllowanceAmount(context),
              kind: TxMetaKind.approve,
              spender: context.spender,
              token: context.token,
            }),
            'allowanceTransaction',
          ),
        })),
        killTransactionMachine: pure((context) => {
          if (context.refTransactionMachine && context.refTransactionMachine.stop) {
            context.refTransactionMachine.stop()
          }
          return undefined
        }),
        sendAllowanceSetEvent: sendParent((context) => ({
          type: 'ALLOWANCE_SUCCESS',
          amount: getEffectiveAllowanceAmount(context),
          token: context.token,
          spender: context.spender,
        })),
      },
    },
  )
}

export type AllowanceStateMachine = ReturnType<typeof createAllowanceStateMachine>
