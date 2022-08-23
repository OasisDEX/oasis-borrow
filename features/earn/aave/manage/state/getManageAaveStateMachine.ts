import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { ManageAavePositionData } from '../pipelines/manageAavePosition'
import { ManageAaveParametersStateMachineType } from '../transaction'
import { createManageAaveStateMachine } from './machine'
import { ManageAaveStateMachineServices } from './services'
import { ManageAaveStateMachine } from './types'

export function getManageAaveStateMachine$(
  services: ManageAaveStateMachineServices,
  parametersMachine$: Observable<ManageAaveParametersStateMachineType>,
  proxyMachine$: Observable<ProxyStateMachine>,
  transactionStateMachine: TransactionStateMachine<ManageAavePositionData>,
): Observable<ManageAaveStateMachine> {
  return combineLatest(parametersMachine$, proxyMachine$).pipe(
    map(([parametersMachine, proxyMachine]) => {
      return createManageAaveStateMachine
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
