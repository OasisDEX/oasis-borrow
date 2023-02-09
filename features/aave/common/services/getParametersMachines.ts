import { TxHelpers } from 'components/AppContext'
import {
  AdjustAaveParameters,
  CloseAaveParameters,
  getAdjustAaveParameters,
  getCloseAaveParameters,
  getManageAaveParameters,
  getOpenAaveParameters,
  ManageAaveParameters,
  OpenAaveParameters,
} from 'features/aave/oasisActionsLibWrapper'
import { createTransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import { HasGasEstimation } from 'helpers/form'
import { Observable } from 'rxjs'

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

export function getDepositBorrowAaveMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: ManageAaveParameters) => getManageAaveParameters(parameters),
  )
}
