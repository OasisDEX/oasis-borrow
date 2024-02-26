import type { TxMeta } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import type { ApproveTokenTransactionParameters } from 'blockchain/better-calls/erc20'
import { createApproveTransaction } from 'blockchain/better-calls/erc20'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import type { ethers } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import type {
  EthersTransactionStateMachine,
  TransactionStateMachine,
  TransactionStateMachineResultEvents,
} from 'features/stateMachines/transaction'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import { zero } from 'helpers/zero'
import { Erc20__factory } from 'types/ethers-contracts'
import type { ActorRefFrom } from 'xstate'
import { assign, createMachine, interpret, sendParent, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'

export type AllowanceType = 'unlimited' | 'custom' | 'minimum'

type RefTransactionMachine =
  | ActorRefFrom<TransactionStateMachine<AllowanceTxMeta>>
  | ActorRefFrom<EthersTransactionStateMachine<ApproveTokenTransactionParameters>>

export interface AllowanceStateMachineContext {
  token: string
  customDecimals?: number
  customTokenAddress?: string
  spender: string
  amount?: BigNumber
  minimumAmount: BigNumber

  allowanceType: AllowanceType
  error?: string | unknown
  refTransactionMachine?: RefTransactionMachine
  runWithEthers: boolean
  networkId: NetworkIds
  signer?: ethers.Signer
  result?: unknown
}

/**
 * The returned amount should be in human-readable units, for example 10.3 WBTC.
 * @param context
 */
function getEffectiveAllowanceAmount(context: AllowanceStateMachineContext) {
  if (context.allowanceType === 'unlimited') {
    return maxUint256
  }

  let amount = context.amount ?? zero

  if (context.allowanceType === 'minimum') {
    amount = context.minimumAmount
  }

  if (context.customDecimals !== undefined) {
    return amount.div(new BigNumber(10).pow(context.customDecimals))
  }
  return amount
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
  | { type: 'UPDATE_TOKEN'; token: string; customDecimals?: number; customTokenAddress?: string }
  | { type: 'SET_ALLOWANCE'; amount?: BigNumber; allowanceType: AllowanceType }
  | {
      type: 'SET_ALLOWANCE_CONTEXT' | 'RESET_ALLOWANCE_CONTEXT'
      minimumAmount: BigNumber
      token: string
      spender: string
      allowanceType: AllowanceType
    }
  | TransactionStateMachineResultEvents
  | { type: 'CREATED_MACHINE'; refTransactionMachine: RefTransactionMachine }

export function createAllowanceStateMachine(
  transactionStateMachine: (
    parameters: AllowanceTxMeta,
  ) => TransactionStateMachine<AllowanceTxMeta>,
) {
  return createMachine(
    {
      //eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./createAllowanceStateMachine.typegen').Typegen0,
      preserveActionOrder: true,
      predictableActionArguments: true,
      schema: {
        context: {} as AllowanceStateMachineContext,
        events: {} as AllowanceStateMachineEvent,
      },
      id: 'allowance',
      initial: 'resolvingToken',
      states: {
        resolvingToken: {
          invoke: {
            src: 'resolveToken',
            id: 'resolveToken',
          },
          on: {
            UPDATE_TOKEN: {
              actions: ['updateContext'],
              target: 'idle',
            },
          },
        },
        idle: {
          on: {
            NEXT_STEP: [
              {
                cond: 'runWithEthers',
                target: 'txInProgressEthers',
              },
              {
                cond: 'isAllowanceValid',
                target: 'txInProgress',
              },
            ],
            SET_ALLOWANCE: {
              actions: ['updateContext'],
            },
            SET_ALLOWANCE_CONTEXT: {
              actions: ['updateContext'],
            },
          },
        },
        txInProgressEthers: {
          invoke: {
            src: 'runTransaction',
            id: 'runTransaction',
          },
          on: {
            CREATED_MACHINE: {
              actions: ['updateContext'],
            },
            TRANSACTION_COMPLETED: {
              actions: ['updateContext'],
              target: 'txSuccess',
            },
            TRANSACTION_FAILED: {
              target: 'txFailure',
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
        runWithEthers: (context) =>
          isAllowanceValid(context) && context.runWithEthers && context.signer !== undefined,
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
      services: {
        runTransaction: (context) => async (sendBack, _onReceive) => {
          const contracts = getNetworkContracts(context.networkId!)
          ensureEtherscanExist(context.networkId!, contracts)

          const { etherscan } = contracts

          const machine =
            createEthersTransactionStateMachine<ApproveTokenTransactionParameters>().withContext({
              etherscanUrl: etherscan.url,
              transaction: createApproveTransaction,
              transactionParameters: {
                networkId: context.networkId!,
                signer: context.signer!,
                amount: getEffectiveAllowanceAmount(context),
                spender: context.spender,
                token: context.customTokenAddress ?? context.token,
              },
            })

          const actor = interpret(machine, {
            id: 'ethersTransactionMachine',
          }).start()

          sendBack({ type: 'CREATED_MACHINE', refTransactionMachine: actor })

          actor.onTransition((state) => {
            if (state.matches('success')) {
              sendBack({ type: 'TRANSACTION_COMPLETED' })
            } else if (state.matches('failure')) {
              sendBack({ type: 'TRANSACTION_FAILED', error: state.context.txError })
            }
          })

          return () => {
            actor.stop()
          }
        },
        resolveToken: (context) => async (sendBack) => {
          if (isAddress(context.token)) {
            const factory = Erc20__factory.connect(context.token, context.signer!)
            const [resolvedTokenSymbol, resolvedDecimals] = await Promise.all([
              factory.symbol(),
              factory.decimals(),
            ])
            return sendBack({
              type: 'UPDATE_TOKEN',
              token: resolvedTokenSymbol,
              customDecimals: resolvedDecimals,
              customTokenAddress: context.token,
            })
          }
          return sendBack({ type: 'UPDATE_TOKEN', token: context.token })
        },
      },
    },
  )
}

export type AllowanceStateMachine = ReturnType<typeof createAllowanceStateMachine>
