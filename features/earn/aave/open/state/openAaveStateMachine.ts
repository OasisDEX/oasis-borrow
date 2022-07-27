import { Observable } from 'rxjs'
import { assign, createMachine, spawn } from 'xstate'

import { TokenBalances } from '../../../../../blockchain/tokens'
import { zero } from '../../../../../helpers/zero'
import { ProxyStateMachine } from '../../../../proxyNew/state/proxyStateMachine.types'
import { getNameOfService, services } from './openAaveStateMachine.services'
import { OpenAaveContext, OpenAaveEvent, OpenAaveState } from './openAaveStateMachine.types'

export function openAaveStateMachine(
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  getProxyStateMachine: () => ProxyStateMachine,
) {
  return createMachine<OpenAaveContext, OpenAaveEvent, OpenAaveState>(
    {
      key: 'aaveOpen',
      initial: 'editing',
      context: {
        dependencies: {
          tokenBalances$,
          getProxyStateMachine,
          proxyAddress$,
        },
      },
      states: {
        editing: {
          entry: [
            assign((context) => ({
              currentStep: 1,
              token: 'ETH',
              totalSteps: context.proxyAddress ? 2 : 3,
              canGoToNext: context.proxyAddress === undefined || context.amount?.gt(zero),
            })),
          ],
          invoke: {
            src: getNameOfService('initMachine'),
          },
          on: {
            SET_BALANCE: {
              actions: [
                assign((_, event) => ({
                  tokenBalance: event.balance,
                  tokenPrice: event.tokenPrice,
                })),
              ],
            },
            PROXY_ADDRESS_RECEIVED: {
              actions: [
                assign((_, event) => ({
                  proxyAddress: event.proxyAddress,
                  totalSteps: event.proxyAddress ? 2 : 3,
                })),
              ],
            },
            SET_AMOUNT: {
              actions: [
                assign((context, event) => ({
                  amount: event.amount,
                  auxiliaryAmount: event.amount.times(context.tokenPrice || zero),
                  canGoToNext: context.proxyAddress === undefined || event.amount.gt(0),
                })),
              ],
            },
            CREATE_PROXY: {
              target: 'proxyCreating',
              cond: (context, _) => context.proxyAddress === undefined,
            },
            CONFIRM_DEPOSIT: {
              target: 'reviewing',
              cond: (context, _) => context.proxyAddress !== undefined,
            },
          },
        },
        proxyCreating: {
          entry: [
            assign(({ dependencies }) => ({
              refProxyMachine: spawn(dependencies.getProxyStateMachine(), {
                name: 'proxy',
                sync: true,
              }),
            })),
          ],
          on: {
            PROXY_CREATED: {
              target: 'editing',
              actions: [assign((_, event) => ({ proxyAddress: event.proxyAddress }))],
            },
          },
        },
        reviewing: {
          entry: [assign((_) => ({ currentStep: 2 }))],
          on: {
            START_CREATING_POSITION: {
              target: 'txInProgress',
            },
          },
        },

        txInProgress: {
          invoke: {
            src: getNameOfService('createPosition'),
          },
          on: {
            TRANSACTION_SUCCESS: {
              target: 'txSuccess',
              actions: [assign((_, event) => ({ vaultNumber: event.vaultNumber }))],
            },
            TRANSACTION_FAILURE: {
              target: 'txFailure',
              actions: [assign((_, event) => ({ txError: event.txError }))],
            },
          },
          initial: 'txWaitingForApproval',
          states: {
            txWaitingForApproval: {
              on: {
                TRANSACTION_IN_PROGRESS: {
                  target: 'txInProgress',
                  actions: [assign((_, event) => ({ txHash: event.txHash }))],
                },
              },
            },
            txInProgress: {
              on: {
                TRANSACTION_CONFIRMED: {
                  target: 'txInProgress',
                  actions: [
                    assign((_, event) => ({
                      confirmations: event.confirmations,
                    })),
                  ],
                },
              },
            },
          },
        },
        txFailure: {},
        txSuccess: {},
        opened: {},
      },
    },
    {
      services: {
        ...services,
      },
    },
  )
}
