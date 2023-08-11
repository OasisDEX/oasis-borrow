import { getOpenDepositBorrowPositionParameters, getOpenPositionParameters } from 'actions/aave'
import { OpenAaveParameters } from 'actions/aave/types'
import { NetworkIds } from 'blockchain/networks'
import { TxHelpers } from 'components/AppContext'
import {
  createTransactionParametersStateMachine,
  TransactionParametersStateMachine,
} from 'features/stateMachines/transactionParameters'
import { HasGasEstimation } from 'helpers/form'
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
