import {
  getOpenDepositBorrowPositionParameters,
  getOpenPositionParameters,
} from 'actions/aave-like'
import type { OpenAaveParameters } from 'actions/aave-like/types'
import type { NetworkIds } from 'blockchain/networks'
import type { TransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import { createTransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { Observable } from 'rxjs'

export function getOpenAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  networkId: NetworkIds,
): TransactionParametersStateMachine<OpenAaveParameters> {
  return createTransactionParametersStateMachine(
    txHelpers$,
    async (parameters: OpenAaveParameters) => {
      try {
        if (parameters.positionType === 'Borrow')
          return await getOpenDepositBorrowPositionParameters(parameters)
        return await getOpenPositionParameters(parameters)
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    networkId,
    'open',
  )
}
