import type { ethers } from 'ethers'
import { assign, createMachine } from 'xstate'

export type EthersTransactionStateMachineContext<TParameters, TResult = unknown> = {
  txHash?: string
  txError?: string | unknown
  confirmations?: number
  safeConfirmations?: number
  etherscanUrl: string
  transactionParameters: TParameters
  transaction: (parameters: TParameters) => Promise<ethers.ContractTransaction>
  extract?: (receipt: ethers.ContractReceipt) => TResult
  result?: TResult
}

export type EthersTransactionStateMachineResultEvents<TResult = unknown> =
  | { type: 'TRANSACTION_COMPLETED'; result?: TResult }
  | { type: 'TRANSACTION_FAILED'; error: string | unknown }

export type EthersTransactionStateMachineEvents<TParameters, TResult> =
  | EthersTransactionStateMachineResultEvents<TResult>
  | { type: 'START' }
  | { type: 'PARAMETERS_CHANGED'; parameters: TParameters }
  | { type: 'WAITING_FOR_CONFIRMATIONS'; confirmations?: number }
  | { type: 'WAITING_FOR_APPROVAL' }
  | { type: 'IN_PROGRESS'; txHash: string }
  | { type: 'FAILURE'; txError?: string }
  | { type: 'CONFIRMED'; confirmations: number; result?: TResult }

export function createEthersTransactionStateMachine<TParameters, TResult = unknown>() {
  return createMachine(
    {
      id: 'ethers-transaction',
      predictableActionArguments: true,
      preserveActionOrder: true,
      //eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./ethersTransactionStateMachine.typegen').Typegen0,
      context: {
        etherscanUrl: '',
        transactionParameters: {} as TParameters,
        transaction: () => Promise.resolve({} as ethers.ContractTransaction),
        extract: () => ({}) as TResult,
      },
      schema: {
        context: {} as EthersTransactionStateMachineContext<TParameters, TResult>,
        events: {} as EthersTransactionStateMachineEvents<TParameters, TResult>,
      },
      initial: 'inProgress',
      states: {
        inProgress: {
          invoke: {
            src: 'startTransaction',
            id: 'startTransaction',
            onDone: {
              target: 'success',
              description: 'Transaction success',
            },
            onError: {
              actions: ['getError'],
              target: 'failure',
            },
          },
          on: {
            WAITING_FOR_CONFIRMATIONS: {
              actions: ['updateContext'],
            },
            WAITING_FOR_APPROVAL: {},
            IN_PROGRESS: {
              actions: ['updateContext'],
            },
            FAILURE: {
              target: 'failure',
              actions: ['updateContext'],
            },
            CONFIRMED: {
              target: 'success',
              actions: ['updateContext'],
            },
          },
        },
        failure: {},
        success: {},
      },
    },
    {
      actions: {
        updateContext: assign((context, event) => ({ ...event })),
        getError: assign((context, event) => {
          return {
            txError: event.data,
          }
        }),
      },
      services: {
        startTransaction: (context, _) => async (sendBack, _onReceive) => {
          if (!context.transactionParameters) {
            throw new Error('Transaction parameters not defined')
          }

          try {
            const result = await context.transaction(context.transactionParameters)
            sendBack({
              type: 'WAITING_FOR_CONFIRMATIONS',
              confirmations: result.confirmations,
            })

            const receipt = await result.wait()
            const extractedResult = context.extract ? context.extract(receipt) : undefined
            sendBack({
              type: 'CONFIRMED',
              confirmations: receipt.confirmations,
              result: extractedResult,
            })
          } catch (error) {
            console.warn(`Transaction failed: ${error}`, error)
            sendBack({
              type: 'FAILURE',
              txError: `Transaction failed: ${error}`,
            })
          }

          return () => {}
        },
      },
    },
  )
}

class EthersTransactionStateMachineTypes<T, TResult = unknown> {
  needsConfiguration() {
    return createEthersTransactionStateMachine<T, TResult>()
  }

  withConfig() {
    // @ts-ignore
    return createEthersTransactionStateMachine<T, TResult>().withConfig({})
  }
}

export type EthersTransactionStateMachine<T, TResult = unknown> = ReturnType<
  EthersTransactionStateMachineTypes<T, TResult>['withConfig']
>
