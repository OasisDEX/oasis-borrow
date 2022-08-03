import { assign, send } from 'xstate'

import { zero } from '../../../../../helpers/zero'
import { OpenAaveContext, OpenAaveEvent } from './types'

const initContextValues = assign<OpenAaveContext, OpenAaveEvent>((context) => ({
  currentStep: 1,
  token: 'ETH',
  totalSteps: context.proxyAddress ? 2 : 3,
  canGoToNext: context.proxyAddress === undefined || context.amount?.gt(zero),
  multiply: 2,
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

const sendUpdateToParametersCaller = send<OpenAaveContext, OpenAaveEvent>(
  (context, event) => {
    if (event.type !== 'SET_AMOUNT') return event // In the future add change token or multiply
    return {
      type: 'TRANSACTION_PARAMETERS_CHANGED',
      amount: event.amount,
      multiply: context.multiply,
      token: context.token,
    }
  },
  { to: 'getTransactionParameters' },
)

const setTxHash = assign<OpenAaveContext, OpenAaveEvent>((_, event) => {
  if (event.type !== 'TRANSACTION_IN_PROGRESS') return {}
  return {
    txHash: event.txHash,
  }
})

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

const setTxError = assign<OpenAaveContext, OpenAaveEvent>((_, event) => {
  if (event.type !== 'TRANSACTION_FAILURE') return {}
  return {
    txError: event.txError,
  }
})

const setConfirmations = assign<OpenAaveContext, OpenAaveEvent>((_, event) => {
  if (event.type !== 'TRANSACTION_CONFIRMED') return {}
  return {
    confirmations: event.confirmations,
  }
})

const calculateAuxiliaryAmount = assign<OpenAaveContext, OpenAaveEvent>((context) => ({
  auxiliaryAmount: context.amount?.times(context.tokenPrice || zero),
}))

const getProxyAddressFromProxyMachine = assign<OpenAaveContext, OpenAaveEvent>(
  ({ proxyStateMachine }) => ({
    proxyAddress: proxyStateMachine?.context.proxyAddress,
  }),
)

const setCurrentStepToTwo = assign<OpenAaveContext, OpenAaveEvent>(() => ({
  currentStep: 2,
}))

const createProxyMachine = assign<OpenAaveContext, OpenAaveEvent>((context) => ({
  proxyStateMachine: context.dependencies.proxyStateMachineCreator(),
}))

export const actions = {
  initContextValues,
  setTokenBalanceFromEvent,
  setReceivedProxyAddress,
  setTxHash,
  updateTotalSteps,
  setAmount,
  setVaultNumber,
  setTxError,
  setConfirmations,
  setCurrentStepToTwo,
  calculateAuxiliaryAmount,
  getProxyAddressFromProxyMachine,
  createProxyMachine,
  sendUpdateToParametersCaller,
}
