import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { assign, sendParent, spawn } from 'xstate'

import { ProxyContext, ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { AaveStEthSimulateStateMachine } from '../components/simulate/aaveStEthSimulateStateMachine'
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import { OpenAaveParametersStateMachine } from '../transaction'
import { createOpenAaveStateMachine, OpenAaveEvent, OpenAaveStateMachineServices } from './machine'
import { contextToTransactionParameters } from './services'

export function getOpenAaveStateMachine$(
  services: OpenAaveStateMachineServices,
  parametersMachine$: Observable<OpenAaveParametersStateMachine>,
  proxyMachine$: Observable<ProxyStateMachine>,
  transactionStateMachine: TransactionStateMachine<OpenAavePositionData>,
  simulationMachine: AaveStEthSimulateStateMachine,
) {
  return combineLatest(parametersMachine$, proxyMachine$).pipe(
    map(([parametersMachine, proxyMachine]) => {
      return createOpenAaveStateMachine.withConfig({
        services: {
          ...services,
        },
        actions: {
          spawnParametersMachine: assign((_) => ({
            refParametersStateMachine: spawn(
              parametersMachine.withConfig({
                actions: {
                  notifyParent: sendParent(
                    (context): OpenAaveEvent => ({
                      type: 'TRANSACTION_PARAMETERS_RECEIVED',
                      parameters: context.transactionParameters!,
                    }),
                  ),
                },
              }),
              { name: 'parametersMachine' },
            ),
          })),
          spawnProxyMachine: assign((_) => ({
            refProxyMachine: spawn(
              proxyMachine.withConfig({
                actions: {
                  raiseSuccess: sendParent(
                    (context: ProxyContext): OpenAaveEvent => ({
                      type: 'PROXY_CREATED',
                      proxyAddress: context.proxyAddress!,
                    }),
                  ),
                },
              }),
              { name: 'proxyMachine' },
            ),
          })),
          spawnTransactionMachine: assign((context) => ({
            refTransactionMachine: spawn(
              transactionStateMachine
                .withConfig({
                  actions: {
                    notifyParent: sendParent(
                      (_): OpenAaveEvent => ({
                        type: 'POSITION_OPENED',
                      }),
                    ),
                  },
                })
                .withContext({
                  ...transactionStateMachine.context,
                  transactionParameters: contextToTransactionParameters(context),
                }),
              {
                name: 'transactionMachine',
              },
            ),
          })),
          spawnSimulationMachine: assign((_) => ({
            refSimulationMachine: spawn(simulationMachine, {
              name: 'simulationMachine',
            }),
          })),
        },
      })
    }),
  )
}
