import {
  getOpenDepositBorrowPositionParameters,
  getOpenPositionParameters,
} from 'actions/aave-like'
import type { OpenAaveParameters } from 'actions/aave-like/types'
import type { NetworkIds } from 'blockchain/networks'
import type { TransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import { createTransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import type { TxHelpers } from 'helpers/context/types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation'
import type { Observable } from 'rxjs'

export function getOpenAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
  networkId: NetworkIds,
): TransactionParametersStateMachine<OpenAaveParameters> {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
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
