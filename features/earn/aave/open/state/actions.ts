import { ActionObject, assign, send, spawn } from 'xstate'
import { choose } from 'xstate/lib/actions'

import { zero } from '../../../../../helpers/zero'
import { assertEventType } from '../../../../../utils/xstate'
import { OpenAaveParametersStateMachineEvents } from '../transaction/openAaveParametersStateMachine'
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
    cond: (context, event) =>
      event.type === 'SET_AMOUNT' && context.refParametersStateMachine !== undefined,
    actions: [
      send<OpenAaveContext, OpenAaveEvent>(
        (context, event): OpenAaveParametersStateMachineEvents => {
          assertEventType(event, 'SET_AMOUNT')
          return {
            type: 'VARIABLES_RECEIVED',
            amount: event.amount,
            multiply: context.multiply,
            token: context.token,
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
  ({ dependencies }) => ({
    proxyAddress: dependencies.proxyStateMachine.context.proxyAddress,
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

const getTransactionParametersFromParametersMachine = assign<OpenAaveContext, OpenAaveEvent>(
  (context) => {
    if (context.refParametersStateMachine === undefined) return {}
    return {
      transactionParameters: context.refParametersStateMachine.state.context.transactionParameters,
      estimatedGasPrice: context.refParametersStateMachine.state.context.gasPriceEstimation,
    }
  },
)

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
  getTransactionParametersFromParametersMachine = 'getTransactionParametersFromParametersMachine',
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
  getTransactionParametersFromParametersMachine,
}
