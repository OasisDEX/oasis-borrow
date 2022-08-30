import { ActionObject, assign, send, spawn } from 'xstate'
import { choose, log } from 'xstate/lib/actions'

import { zero } from '../../../../../helpers/zero'
import { assertErrorEvent } from '../../../../../utils/xstate'
import { TransactionStateMachineEvents } from '../../../../stateMachines/transaction'
import { ManageAavePositionData } from '../pipelines/manageAavePosition'
import { ManageAaveParametersStateMachineEvents } from '../transaction/manageAaveParametersStateMachine'
import { contextToTransactionParameters } from './services'
import { ManageAaveContext, ManageAaveEvent } from './types'

const initContextValues = assign<ManageAaveContext, ManageAaveEvent>(() => ({
  currentStep: 1,
  totalSteps: 2,
}))

const setTokenBalanceFromEvent = assign<ManageAaveContext, ManageAaveEvent>((_) => {
  return {}
  // if (event.type !== 'SET_BALANCE') return {}
  //
  // return {
  //   tokenBalance: event.balance,
  //   tokenPrice: event.tokenPrice,
  // }
})

const setReceivedProxyAddress = assign<ManageAaveContext, ManageAaveEvent>((_, event) => {
  if (event.type !== 'PROXY_ADDRESS_RECEIVED') return {}
  return {
    proxyAddress: event.proxyAddress,
  }
})

const sendUpdateToParametersMachine = choose<ManageAaveContext, ManageAaveEvent>([
  {
    cond: (context) => context.refParametersStateMachine !== undefined,
    actions: [
      send<ManageAaveContext, ManageAaveEvent>(
        (context): ManageAaveParametersStateMachineEvents => {
          return {
            type: 'VARIABLES_RECEIVED',
            amount: context.amount!,
            multiply: context.multiply,
            token: context.token,
            proxyAddress: context.proxyAddress,
          }
        },
        { to: (context) => context.refParametersStateMachine!, delay: 1000 },
      ),
    ],
  },
])

const updateTotalSteps = assign<ManageAaveContext, ManageAaveEvent>((context) => ({
  totalSteps: context.proxyAddress ? 2 : 3,
}))

const setAmount = assign<ManageAaveContext, ManageAaveEvent>((_) => {
  // if (event.type !== 'SET_AMOUNT') return {}
  return {
    // amount: event.amount,
  }
})

const setVaultNumber = assign<ManageAaveContext, ManageAaveEvent>((_, event) => {
  if (event.type !== 'TRANSACTION_SUCCESS') return {}

  return {
    vaultNumber: event.vaultNumber,
  }
})

const calculateAuxiliaryAmount = assign<ManageAaveContext, ManageAaveEvent>((context) => ({
  auxiliaryAmount: context.amount?.times(context.tokenPrice || zero),
}))

const getProxyAddressFromProxyMachine = assign<ManageAaveContext, ManageAaveEvent>(
  ({ refProxyStateMachine }) => ({
    proxyAddress: refProxyStateMachine?.state.context.proxyAddress,
  }),
)

const setCurrentStepToTwo = assign<ManageAaveContext, ManageAaveEvent>(() => ({
  currentStep: 2,
}))

const spawnParametersMachine = assign<ManageAaveContext, ManageAaveEvent>((context) => {
  if (context.refParametersStateMachine) return {}
  return {
    refParametersStateMachine: spawn(context.dependencies.parametersStateMachine),
  }
})

const spawnTransactionMachine = assign<ManageAaveContext, ManageAaveEvent>((context) => {
  if (context.refTransactionStateMachine) return {}
  return {
    refTransactionStateMachine: spawn(context.dependencies.transactionStateMachine, {
      name: 'transaction',
    }),
  }
})

const spawnProxyMachine = assign<ManageAaveContext, ManageAaveEvent>((context) => {
  if (context.refProxyStateMachine) return {}
  return {
    refProxyStateMachine: spawn(context.dependencies.proxyStateMachine, {
      name: 'proxy',
    }),
  }
})

const getTransactionParametersFromParametersMachine = assign<ManageAaveContext, ManageAaveEvent>(
  (context) => {
    if (context.refParametersStateMachine === undefined) return {}
    return {
      transactionParameters: context.refParametersStateMachine.state.context.transactionParameters,
      estimatedGasPrice: context.refParametersStateMachine.state.context.gasPriceEstimation,
    }
  },
)

const startTransaction = choose<ManageAaveContext, ManageAaveEvent>([
  {
    cond: (context) => context.refTransactionStateMachine !== undefined,
    actions: [
      send<ManageAaveContext, ManageAaveEvent>(
        (): TransactionStateMachineEvents<ManageAavePositionData> => {
          return {
            type: 'START',
          }
        },
        { to: (context) => context.refTransactionStateMachine! },
      ),
    ],
  },
])

const updateTransactionParameters = choose<ManageAaveContext, ManageAaveEvent>([
  {
    cond: (context) => context.refTransactionStateMachine !== undefined,
    actions: [
      send<ManageAaveContext, ManageAaveEvent>(
        (context): TransactionStateMachineEvents<ManageAavePositionData> => {
          return {
            type: 'PARAMETERS_CHANGED',
            parameters: contextToTransactionParameters(context),
          }
        },
        { to: (context) => context.refTransactionStateMachine! },
      ),
    ],
  },
])

const logError = log<ManageAaveContext, ManageAaveEvent>((context, event) => {
  assertErrorEvent(event)
  return {
    error: event.data,
  }
})

export enum actions {
  initContextValues = 'initContextValues',
  setTokenBalanceFromEvent = 'setTokenBalanceFromEvent',
  setReceivedProxyAddress = 'setReceivedProxyAddress',
  updateTotalSteps = 'updateTotalSteps',
  setAmount = 'setAmount',
  setVaultNumber = 'setVaultNumber',
  setCurrentStepToTwo = 'setCurrentStepToTwo',
  calculateAuxiliaryAmount = 'calculateAuxiliaryAmount',
  getProxyAddressFromProxyMachine = 'getProxyAddressFromProxyMachine',
  sendUpdateToParametersMachine = 'sendUpdateToParametersMachine',
  spawnParametersMachine = 'spawnParametersMachine',
  spawnProxyMachine = 'spawnProxyMachine',
  spawnTransactionMachine = 'spawnTransactionMachine',
  getTransactionParametersFromParametersMachine = 'getTransactionParametersFromParametersMachine',
  startTransaction = 'startTransaction',
  updateTransactionParameters = 'updateTransactionParameters',
  logError = 'logError',
}

export const manageAaveMachineActions: {
  [key in actions]: ActionObject<ManageAaveContext, ManageAaveEvent>
} = {
  initContextValues,
  setTokenBalanceFromEvent,
  setReceivedProxyAddress,
  updateTotalSteps,
  setAmount,
  setVaultNumber,
  setCurrentStepToTwo,
  calculateAuxiliaryAmount,
  getProxyAddressFromProxyMachine,
  sendUpdateToParametersMachine,
  spawnParametersMachine,
  spawnProxyMachine,
  spawnTransactionMachine,
  getTransactionParametersFromParametersMachine,
  startTransaction,
  updateTransactionParameters,
  logError,
}
