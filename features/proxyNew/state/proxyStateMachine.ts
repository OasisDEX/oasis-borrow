import { Observable } from 'rxjs'
import { assign, createMachine } from 'xstate'
import { sendParent } from 'xstate/lib/actions'

import { TxHelpers } from '../../../components/AppContext'
import { GasEstimationStatus, HasGasEstimation } from '../../../helpers/form'
import { getNameOfService, services } from './proxyStateMachine.services'
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
        dependencies: {
          txHelper,
          proxyAddress$,
          getGasEstimation$,
          safeConfirmations,
        },
      },
      initial: 'proxyIdle',
      states: {
        proxyIdle: {
          invoke: {
            src: getNameOfService('estimateGas'),
          },
          entry: [
            assign(() => ({
              gasData: { status: GasEstimationStatus.calculating },
            })),
          ],
          on: {
            START: {
              target: 'proxyInProgress',
            },
            GAS_COST_ESTIMATION: {
              actions: [assign((context, event) => ({ gasData: event.gasData }))],
            },
          },
        },
        proxyInProgress: {
          invoke: {
            src: getNameOfService('createProxy'),
          },
          on: {
            SUCCESS: {
              target: 'proxySuccess',
              actions: [
                assign((_, event) => ({ proxyAddress: event.proxyAddress })),
                sendParent((_, event) => ({
                  type: 'proxyCreated',
                  proxyAddress: event.proxyAddress,
                })),
              ],
            },
            FAILURE: {
              target: 'proxyFailure',
              actions: [assign((_, event) => ({ txError: event.txError }))],
            },
          },
          initial: 'proxyWaitingForApproval',
          states: {
            proxyWaitingForApproval: {
              on: {
                IN_PROGRESS: {
                  target: 'proxyInProgress',
                  actions: [assign((_, event) => ({ txHash: event.proxyTxHash }))],
                },
              },
            },
            proxyInProgress: {
              on: {
                CONFIRMED: {
                  target: 'proxyInProgress',
                  actions: [
                    assign((_, event) => ({
                      proxyConfirmations: event.proxyConfirmations,
                    })),
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
