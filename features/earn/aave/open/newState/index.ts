import { assign, spawn } from 'xstate'

import { zero } from '../../../../../helpers/zero'
import { openAaveStateMachine } from './openAavePositionMachine'

export const machine = openAaveStateMachine.withConfig({
  services: {
    spawnTransactionMachine: (context) => context.transactionMachine,
    spawnProxyMachine: (context) => context.proxyMachine,
    getBalance: () => {
      throw new Error('Not implemented')
    },
    getProxyAddress: () => {
      throw new Error('Not implemented')
    },
  },
  actions: {
    spawnParametersMachine: assign((context) => {
      if (context.transactionParametersMachine) return {}
      return {
        transactionParametersMachine: spawn(context.transactionParameters),
      }
    }),
    assignProxyAddress: assign((context, event) => {
      return {
        proxyAddress: event.data.proxyAddress,
      }
    }),
  },
  guards: {
    emptyProxyAddress: (context) =>
      context.proxyAddress === '' || context.proxyAddress === undefined,
    enoughBalance: (context) => context.tokenBalance?.gt(context.amount || zero) || false,
    validTransactionParameters: ({ proxyAddress, transactionParameters, amount }) => {
      return (
        amount !== undefined && proxyAddress !== undefined && transactionParameters !== undefined
      )
    },
  },
})
