import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ProxyStateMachine } from '../../../../proxyNew/state'
import { OpenAaveParametersStateMachineType } from '../transaction'
import { createOpenAaveStateMachine } from './machine'
import { OpenAaveStateMachineServices } from './services'
import { OpenAaveStateMachine } from './types'

export function getOpenAaveStateMachine$(
  services: OpenAaveStateMachineServices,
  parametersMachine$: Observable<OpenAaveParametersStateMachineType>,
  proxyMachine$: Observable<ProxyStateMachine>,
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
            parametersStateMachine: parametersMachine,
            proxyStateMachine: proxyMachine,
          },
          token: 'ETH',
          multiply: 2,
        })
    }),
  )
}
