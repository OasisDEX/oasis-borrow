import { Observable } from 'rxjs'
import { assign, createMachine } from 'xstate'
import { sendParent } from 'xstate/lib/actions'

import { TxHelpers } from '../../../components/AppContext'
import { GasEstimationStatus, HasGasEstimation } from '../../../helpers/form'
import { services } from './proxyStateMachine.services'
import { ProxyContext, ProxyEvent, ProxyState } from './proxyStateMachine.types'

export function createProxyStateMachine(
  txHelper: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
  safeConfirmations: number,
) {
  return createMachine<ProxyContext, ProxyEvent, ProxyState>(
    {
      id: 'proxy',
      context: {
        txHelper,
        proxyAddress$,
        getGasEstimation$,
        safeConfirmations,
      },
      initial: 'proxyIdle',
      states: {
        proxyIdle: {
          invoke: {
            src: 'estimateGas',
          },
          entry: [
            assign({
              gasData: () => ({
                gasEstimationStatus: GasEstimationStatus.calculating,
              }),
            }),
          ],
          on: {
            START: {
              target: 'proxyInProgress',
            },
            GAS_COST_ESTIMATION: {
              actions: [
                assign({
                  gasData: (_, event) => event.gasData,
                }),
              ],
            },
          },
        },
        proxyInProgress: {
          invoke: {
            src: 'createProxy',
          },
          on: {
            SUCCESS: {
              target: 'proxySuccess',
              actions: [
                assign({
                  proxyAddress: (_, event) => event.proxyAddress,
                }),
                sendParent((_, event) => ({
                  type: 'proxyCreated',
                  proxyAddress: event.proxyAddress,
                })),
              ],
            },
            FAILURE: {
              target: 'proxyFailure',
              actions: [
                assign({
                  txError: (context, event) => event.txError,
                }),
              ],
            },
          },
          initial: 'proxyWaitingForApproval',
          states: {
            proxyWaitingForApproval: {
              on: {
                IN_PROGRESS: {
                  target: 'proxyInProgress',
                  actions: [
                    assign({
                      txHash: (context, event) => event.proxyTxHash,
                    }),
                  ],
                },
              },
            },
            proxyInProgress: {
              on: {
                CONFIRMED: {
                  target: 'proxyInProgress',
                  actions: [
                    assign({
                      proxyConfirmations: (context, event) => event.proxyConfirmations,
                    }),
                  ],
                },
              },
            },
          },
        },
        proxySuccess: {
          type: 'final',
        },
        proxyFailure: {
          on: {
            RETRY: {
              target: 'proxyInProgress',
            },
          },
        },
      },
    },
    {
      services: {
        ...services,
      },
    },
  )
}
