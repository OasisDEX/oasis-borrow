import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import { OpenAaveParametersStateMachineType } from '../transaction'
import { createOpenAaveStateMachine } from './machine'
import { OpenAaveStateMachineServices } from './services'
import { OpenAaveStateMachine } from './types'

export function getOpenAaveStateMachine$(
  services: OpenAaveStateMachineServices,
  parametersMachine$: Observable<OpenAaveParametersStateMachineType>,
  proxyMachine$: Observable<ProxyStateMachine>,
  transactionStateMachine: TransactionStateMachine<OpenAavePositionData>,
): Observable<OpenAaveStateMachine> {
  return combineLatest(parametersMachine$, proxyMachine$).pipe(
    map(([parametersMachine, proxyMachine]) => {
      return createOpenAaveStateMachine
        .withConfig({
          services: {
            ...services,
          },
        })
        .withContext({
          dependencies: {
            parametersStateMachine: parametersMachine.withContext({
              // https://xstate.js.org/docs/guides/machines.html#initial-context Look at the warning
              ...parametersMachine.context,
              hasParent: true,
            }),
            proxyStateMachine: proxyMachine,
            transactionStateMachine: transactionStateMachine.withContext({
              ...transactionStateMachine.context,
              hasParent: true,
            }),
          },
          token: 'ETH',
          multiply: 2,
        })
    }),
  )
}
