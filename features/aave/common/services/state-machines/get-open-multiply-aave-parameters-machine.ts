import { OpenMultiplyAaveParameters } from 'actions/aave'
import { getOpenPositionParameters } from 'actions/better-aave'
import { NetworkIds } from 'blockchain/networks'
import { TxHelpers } from 'components/AppContext'
import {
  createTransactionParametersStateMachine,
  TransactionParametersStateMachine,
} from 'features/stateMachines/transactionParameters'
import { HasGasEstimation } from 'helpers/form'
import { Observable } from 'rxjs'

export function getOpenMultiplyAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
  networkId: NetworkIds,
): TransactionParametersStateMachine<OpenMultiplyAaveParameters> {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    async (parameters: OpenMultiplyAaveParameters) => {
      try {
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
