import { OpenMultiplyAaveParameters } from 'actions/aave'
import { TxHelpers } from 'components/AppContext'
import { createTransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import { HasGasEstimation } from 'helpers/form'
import { Observable } from 'rxjs'

import { AaveNetworkProtocolParameters, getProperAction } from './common'

export function getOpenMultiplyAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
  netwrokProtocolParameters: AaveNetworkProtocolParameters,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    async (parameters: OpenMultiplyAaveParameters) => {
      try {
        const operation = getProperAction(netwrokProtocolParameters, 'getOpenTransaction')
        return await operation(parameters)
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    netwrokProtocolParameters.networkId,
    'open',
  )
}
