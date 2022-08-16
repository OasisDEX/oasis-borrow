import { combineLatest, Observable, of } from 'rxjs'

import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { ManageAaveStateMachineServices } from './services'
import { ManageAaveStateMachine } from './types'
import { ManageAavePositionData } from '../pipelines/manageAavePosition'
import { createManageAaveStateMachine } from './machine'
import { ManageAaveParametersStateMachineType } from '../transaction'
import { map } from 'rxjs/operators'

export function getManageAaveStateMachine$(
  services: ManageAaveStateMachineServices,
  parametersMachine$: Observable<ManageAaveParametersStateMachineType>,
  transactionStateMachine: TransactionStateMachine<ManageAavePositionData>,
): Observable<ManageAaveStateMachine> {
  return combineLatest(parametersMachine$).pipe(
    map(([parametersMachine]) => {
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
            transactionStateMachine: transactionStateMachine.withContext({
              ...transactionStateMachine.context,
              hasParent: true,
            }),
          },
        })
    }),
  )
}
