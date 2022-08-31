import { assign, spawn } from 'xstate'
import { log } from 'xstate/lib/actions'

import { zero } from '../../../../../helpers/zero'
import { OpenAaveParametersStateMachine } from '../transaction'
import { openAaveStateMachine } from './openAavePositionMachine'

export function createMachine(parametersMachine: OpenAaveParametersStateMachine) {
  return openAaveStateMachine.withConfig({
    services: {
      spawnTransactionMachine: (context) => context.transactionMachine!,
      spawnProxyMachine: (context) => context.proxyMachine!,
      getBalance: () => {
        throw new Error('Not implemented')
      },
      getProxyAddress: () => {
        throw new Error('Not implemented')
      },
    },
    actions: {
      initContextValues: assign((context) => {
        return {
          strategyName: 'aave',
          token: context.token || 'ETH',
        }
      }),
      logError: log((context, event) => event.data),
      updateTransactionParameters: assign((context, event) => {
        return {
          transactionParameters: event.transactionParameters,
        }
      }),
      spawnParametersMachine: assign((_) => {
        return {
          transactionParametersMachine: spawn(parametersMachine, { name: 'parametersMachine' }),
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
}
