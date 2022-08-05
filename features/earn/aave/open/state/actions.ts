import { ActionObject, assign, send, spawn } from 'xstate'
import { choose, log } from 'xstate/lib/actions'

import { zero } from '../../../../../helpers/zero'
import { assertErrorEvent } from '../../../../../utils/xstate'
import { TransactionStateMachineEvents } from '../../../../stateMachines/transaction'
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import { OpenAaveParametersStateMachineEvents } from '../transaction/openAaveParametersStateMachine'
import { contextToTransactionParameters } from './services'
import { OpenAaveContext, OpenAaveEvent } from './types'

const initContextValues = assign<OpenAaveContext, OpenAaveEvent>((context) => ({
  currentStep: 1,
  totalSteps: context.proxyAddress ? 2 : 3,
}))

const setTokenBalanceFromEvent = assign<OpenAaveContext, OpenAaveEvent>((_, event) => {
  if (event.type !== 'SET_BALANCE') return {}

  return {
    tokenBalance: event.balance,
    tokenPrice: event.tokenPrice,
  }
})

const setReceivedProxyAddress = assign<OpenAaveContext, OpenAaveEvent>((_, event) => {
  if (event.type !== 'PROXY_ADDRESS_RECEIVED') return {}
  return {
    proxyAddress: event.proxyAddress,
  }
})

const sendUpdateToParametersMachine = choose<OpenAaveContext, OpenAaveEvent>([
  {
    cond: (context) => context.refParametersStateMachine !== undefined,
    actions: [
      send<OpenAaveContext, OpenAaveEvent>(
        (context): OpenAaveParametersStateMachineEvents => {
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

const updateTotalSteps = assign<OpenAaveContext, OpenAaveEvent>((context) => ({
  totalSteps: context.proxyAddress ? 2 : 3,
}))

const setAmount = assign<OpenAaveContext, OpenAaveEvent>((_, event) => {
  if (event.type !== 'SET_AMOUNT') return {}
  return {
    amount: event.amount,
  }
})

const setVaultNumber = assign<OpenAaveContext, OpenAaveEvent>((_, event) => {
  if (event.type !== 'TRANSACTION_SUCCESS') return {}
  return {
    vaultNumber: event.vaultNumber,
  }
})

const calculateAuxiliaryAmount = assign<OpenAaveContext, OpenAaveEvent>((context) => ({
  auxiliaryAmount: context.amount?.times(context.tokenPrice || zero),
}))

const getProxyAddressFromProxyMachine = assign<OpenAaveContext, OpenAaveEvent>(
  ({ refProxyStateMachine }) => ({
    proxyAddress: refProxyStateMachine?.state.context.proxyAddress,
  }),
)

const setCurrentStepToTwo = assign<OpenAaveContext, OpenAaveEvent>(() => ({
  currentStep: 2,
}))

const spawnParametersMachine = assign<OpenAaveContext, OpenAaveEvent>((context) => {
  if (context.refParametersStateMachine) return {}
  return {
    refParametersStateMachine: spawn(context.dependencies.parametersStateMachine),
  }
})

const spawnTransactionMachine = assign<OpenAaveContext, OpenAaveEvent>((context) => {
  if (context.refTransactionStateMachine) return {}
  return {
    refTransactionStateMachine: spawn(context.dependencies.transactionStateMachine, {
      name: 'transaction',
    }),
  }
})

const spawnProxyMachine = assign<OpenAaveContext, OpenAaveEvent>((context) => {
  if (context.refProxyStateMachine) return {}
  return {
    refProxyStateMachine: spawn(context.dependencies.proxyStateMachine, {
      name: 'proxy',
    }),
  }
})

const getTransactionParametersFromParametersMachine = assign<OpenAaveContext, OpenAaveEvent>(
  (context) => {
    if (context.refParametersStateMachine === undefined) return {}
    return {
      transactionParameters: context.refParametersStateMachine.state.context.transactionParameters,
      estimatedGasPrice: context.refParametersStateMachine.state.context.gasPriceEstimation,
    }
  },
)

const startTransaction = choose<OpenAaveContext, OpenAaveEvent>([
  {
    cond: (context) => context.refTransactionStateMachine !== undefined,
    actions: [
      send<OpenAaveContext, OpenAaveEvent>(
        (): TransactionStateMachineEvents<OpenAavePositionData> => {
          return {
            type: 'START',
          }
        },
        { to: (context) => context.refTransactionStateMachine! },
      ),
    ],
  },
])

const updateTransactionParameters = choose<OpenAaveContext, OpenAaveEvent>([
  {
    cond: (context) => context.refTransactionStateMachine !== undefined,
    actions: [
      send<OpenAaveContext, OpenAaveEvent>(
        (context): TransactionStateMachineEvents<OpenAavePositionData> => {
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

const logError = log<OpenAaveContext, OpenAaveEvent>((context, event) => {
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

export const openAaveMachineActions: {
  [key in actions]: ActionObject<OpenAaveContext, OpenAaveEvent>
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
