import { ProxyStateMachine } from '@oasis-borrow/proxy/state'
import { nameofFactory } from '@oasis-borrow/utils'
import { Observable } from 'rxjs'
import { assign, Machine, spawn } from 'xstate'

import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { HasGasEstimation } from '../../../../../helpers/form'
import { OpenAaveParametersStateMachineType } from '../transaction'
import { actions } from './actions'
import { emptyProxyAddress, enoughBalance } from './guards'
import { services } from './services'
import { OpenAaveContext, OpenAaveEvent } from './types'

export interface OpenAaveStateMachineSchema {
  states: {
    editing: {}
    proxyCreating: {}
    reviewing: {}
    txInProgress: {}
    txFailure: {}
    txSuccess: {}
  }
}

const nameOfAction = nameofFactory<typeof actions>()
const nameOfService = nameofFactory<typeof services>()

export function createOpenAaveStateMachine(
  txHelper: TxHelpers,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  proxyStateMachineCreator: () => ProxyStateMachine,
  getGasEstimation$: (estimatedGasCost: number) => Observable<HasGasEstimation>,
  preTransactionMachine: OpenAaveParametersStateMachineType,
) {
  return Machine<OpenAaveContext, OpenAaveStateMachineSchema, OpenAaveEvent>(
    {
      key: 'aaveOpen',
      initial: 'editing',
      context: {
        dependencies: {
          txHelper,
          tokenBalances$,
          proxyStateMachineCreator,
          proxyAddress$,
          getGasEstimation$,
        },
      },
      states: {
        editing: {
          entry: [
            nameOfAction('initContextValues'),
            assign(() => {
              return {
                refTransactionHelper: spawn(preTransactionMachine, 'transactionHelper'),
              }
            }),
          ],
          invoke: [
            {
              src: nameOfService('initMachine'),
              id: nameOfService('initMachine'),
              description: 'Initialize the machine - get token balances, proxy address, etc.',
            },
            {
              src: nameOfService('getTransactionParameters'),
              id: 'getTransactionParameters',
            },
          ],
          on: {
            SET_BALANCE: {
              actions: [nameOfAction('setTokenBalanceFromEvent')],
            },
            PROXY_ADDRESS_RECEIVED: {
              actions: [nameOfAction('setReceivedProxyAddress'), nameOfAction('updateTotalSteps')],
            },
            SET_AMOUNT: {
              actions: [
                nameOfAction('setAmount'),
                nameOfAction('calculateAuxiliaryAmount'),
                nameOfAction('sendUpdateToParametersCaller'),
              ],
            },
            CREATE_PROXY: {
              target: 'proxyCreating',
              cond: emptyProxyAddress,
              actions: [nameOfAction('createProxyMachine')],
            },
            CONFIRM_DEPOSIT: {
              target: 'reviewing',
              cond: enoughBalance,
            },
          },
        },
        proxyCreating: {
          invoke: {
            src: nameOfService('invokeProxyMachine'),
            id: nameOfService('invokeProxyMachine'),
            description: 'Create a proxy if one does not exist.',
            onDone: {
              target: 'editing',
              actions: [nameOfAction('getProxyAddressFromProxyMachine')],
            },
          },
        },
        reviewing: {
          entry: [nameOfAction('setCurrentStepToTwo')],
          on: {
            START_CREATING_POSITION: {
              target: 'txInProgress',
            },
          },
        },

        txInProgress: {
          invoke: {
            src: nameOfService('createPosition'),
            id: nameOfService('createPosition'),
            description: 'Invoking transaction on blockchain.',
          },
          on: {
            TRANSACTION_IN_PROGRESS: {
              actions: [nameOfAction('setTxHash')],
            },
            TRANSACTION_CONFIRMED: {
              actions: [nameOfAction('setConfirmations')],
            },
            TRANSACTION_SUCCESS: {
              target: 'txSuccess',
              actions: [nameOfAction('setVaultNumber')],
            },
            TRANSACTION_FAILURE: {
              target: 'txFailure',
              actions: [nameOfAction('setTxError')],
            },
          },
        },
        txFailure: {},
        txSuccess: {
          type: 'final',
        },
      },
    },
    {
      guards: {},
      actions: {
        ...actions,
      },
      services: {
        ...services,
      },
    },
  )
}
