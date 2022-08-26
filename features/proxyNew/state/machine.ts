import { Observable } from 'rxjs'
import { Machine } from 'xstate'

import { TxHelpers } from '../../../components/AppContext'
import { HasGasEstimation } from '../../../helpers/form'
import { nameofFactory } from '../../../utils'
import { actions } from './actions'
import { services } from './services'
import { ProxyContext, ProxyEvent } from './types'

const nameOfService = nameofFactory<typeof services>()
const nameOfAction = nameofFactory<typeof actions>()

export interface ProxyMachineSchema {
  states: {
    proxyIdle: {}
    proxyInProgress: {}
    proxySuccess: {}
    proxyFailure: {}
  }
}

export function createProxyStateMachine(
  txHelper: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
  safeConfirmations: number,
) {
  return Machine<ProxyContext, ProxyMachineSchema, ProxyEvent>(
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
            src: nameOfService('estimateGas'),
            id: nameOfService('estimateGas'),
          },
          entry: [nameOfAction('initGasData')],
          on: {
            START: {
              target: 'proxyInProgress',
            },
            GAS_COST_ESTIMATION: {
              actions: [nameOfAction('assignGasCostData')],
            },
          },
        },
        proxyInProgress: {
          invoke: {
            src: nameOfService('createProxy'),
            id: nameOfService('createProxy'),
            onDone: 'proxySuccess',
            onError: 'proxyFailure',
          },
          on: {
            CONFIRMED: {
              actions: [nameOfAction('assignProxyConfirmations')],
            },
            IN_PROGRESS: {
              actions: [nameOfAction('assignTxHash')],
            },
            SUCCESS: {
              target: 'proxySuccess',
              actions: [nameOfAction('assignProxyAddress')],
            },
            FAILURE: {
              target: 'proxyFailure',
              actions: [nameOfAction('assignTxError')],
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
      actions: {
        ...actions,
      },
      services: {
        ...services,
      },
    },
  )
}
