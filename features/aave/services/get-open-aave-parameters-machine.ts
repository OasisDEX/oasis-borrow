import {
  getOpenDepositBorrowPositionParameters,
  getOpenPositionParameters,
} from 'actions/aave-like'
import { OpenAaveParameters } from 'actions/aave-like/types'
import { NetworkIds } from 'blockchain/networks'
import {
  createTransactionParametersStateMachine,
  TransactionParametersStateMachine,
} from 'features/stateMachines/transactionParameters'
import { HasGasEstimation, TxHelpers } from 'helpers/context/types'
import { Observable } from 'rxjs'

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
