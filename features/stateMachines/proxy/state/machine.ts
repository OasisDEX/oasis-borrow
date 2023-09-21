import type { ContextConnected } from 'blockchain/network.types'
import { allDefined } from 'helpers/allDefined'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import type { Observable } from 'rxjs'
import { nameofFactory } from 'utils'
import { Machine, sendParent } from 'xstate'

import { actions } from './actions'
import { services } from './services'
import type { ProxyContext, ProxyEvent, ProxyResultEvent } from './types'

const nameOfService = nameofFactory<typeof services>()
const nameOfAction = nameofFactory<typeof actions>()

export interface ProxyMachineSchema {
  states: {
    loading: {}
    proxyIdle: {}
    proxyInProgress: {}
    proxySuccess: {}
    proxyFailure: {}
  }
}

export function createProxyStateMachine(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
  context$: Observable<ContextConnected>,
) {
  return Machine<ProxyContext, ProxyMachineSchema, ProxyEvent>(
    {
      predictableActionArguments: true,
      id: 'proxy',
      context: {
        dependencies: {
          txHelpers$,
          proxyAddress$,
          getGasEstimation$,
          context$,
        },
        gasData: {
          gasEstimationStatus: GasEstimationStatus.calculating,
        },
      },
      invoke: [
        {
          src: nameOfService('context$'),
          id: nameOfService('context$'),
        },
        {
          src: nameOfService('txHelpers$'),
          id: nameOfService('txHelpers$'),
        },
      ],
      initial: 'loading',
      states: {
        loading: {
          always: {
            cond: 'hasContextAndTxHelper',
            target: 'proxyIdle',
          },
        },
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
          entry: ['sendProxyCreatedEvent'],
          type: 'final',
          data: {
            proxyAddress: (context: ProxyContext) => context.proxyAddress!,
          },
        },
        proxyFailure: {
          on: {
            RETRY: {
              target: 'proxyInProgress',
            },
          },
        },
      },
      on: {
        CONNECTED_CONTEXT_CHANGED: {
          actions: [nameOfAction('assignContextConnected')],
        },
        TX_HELPERS_CHANGED: {
          actions: [nameOfAction('assignTxHelper')],
        },
      },
    },
    {
      guards: {
        hasContextAndTxHelper: (context: ProxyContext) =>
          allDefined(context.txHelpers, context.contextConnected),
      },
      actions: {
        ...actions,
        sendProxyCreatedEvent: sendParent(
          (context: ProxyContext): ProxyResultEvent => ({
            type: 'PROXY_CREATED',
            connectedProxyAddress: context.proxyAddress!,
          }),
        ),
      },
      services: {
        ...services,
      },
    },
  )
}
