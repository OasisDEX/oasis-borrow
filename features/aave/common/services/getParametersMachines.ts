import { Observable } from 'rxjs'

import { TxHelpers } from '../../../../components/AppContext'
import { HasGasEstimation } from '../../../../helpers/form'
import { createTransactionParametersStateMachine } from '../../../stateMachines/transactionParameters'
import {
  AdjustAaveParameters,
  CloseAaveParameters,
  getAdjustAaveParameters,
  getCloseAaveParameters,
  getOpenAaveParameters,
  OpenAaveParameters,
} from '../../oasisActionsLibWrapper'

export function getOpenAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: OpenAaveParameters) => getOpenAaveParameters(parameters),
  )
}

export function getCloseAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: CloseAaveParameters) => getCloseAaveParameters(parameters),
  )
}

export function getAdjustAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: AdjustAaveParameters) => getAdjustAaveParameters(parameters),
  )
}
