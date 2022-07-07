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
        tokenBalances$,
        getProxyStateMachine,
        proxyAddress$,
      },
      states: {
        editing: {
          entry: [
            assign({
              token: () => 'ETH',
            }),
            assign({
              totalSteps: (context) => (context.proxyAddress ? 2 : 3),
            }),
            assign({
              currentStep: (_) => 1,
            }),
            assign({
              canGoToNext: (context) =>
                context.proxyAddress === undefined || context.amount?.gt(zero),
            }),
          ],
          invoke: {
            src: getNameOfService('initMachine'),
          },
          on: {
            SET_BALANCE: {
              actions: [
                assign({
                  tokenBalance: (_, event) => event.balance,
                }),
                assign({
                  tokenPrice: (_, event) => event.tokenPrice,
                }),
              ],
            },
            SET_AMOUNT: {
              actions: [
                assign({
                  amount: (_, event) => event.amount,
                }),
                assign({
                  auxiliaryAmount: (context, event) =>
                    event.amount.times(context.tokenPrice || zero),
                }),
                assign({
                  canGoToNext: (context, event) =>
                    context.proxyAddress === undefined || event.amount.gt(0),
                }),
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
            assign({
              refProxyMachine: ({ getProxyStateMachine }, _) =>
                spawn(getProxyStateMachine(), {
                  name: 'proxy',
                  sync: true,
                }),
            }),
          ],
          on: {
            PROXY_CREATED: {
              target: 'editing',
              actions: [
                assign({
                  proxyAddress: (context, event) => event.proxyAddress,
                }),
              ],
            },
          },
        },
        reviewing: {
          entry: [
            assign({
              currentStep: (_) => 2,
            }),
          ],
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
              actions: [
                assign({
                  vaultNumber: (_, event) => event.vaultNumber,
                }),
              ],
            },
            TRANSACTION_FAILURE: {
              target: 'txFailure',
              actions: [
                assign({
                  txError: (_, event) => event.txError,
                }),
              ],
            },
          },
          initial: 'txWaitingForApproval',
          states: {
            txWaitingForApproval: {
              on: {
                TRANSACTION_IN_PROGRESS: {
                  target: 'txInProgress',
                  actions: [
                    assign({
                      txHash: (_, event) => event.txHash,
                    }),
                  ],
                },
              },
            },
            txInProgress: {
              on: {
                TRANSACTION_CONFIRMED: {
                  target: 'txInProgress',
                  actions: [
                    assign({
                      confirmations: (_, event) => event.confirmations,
                    }),
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
