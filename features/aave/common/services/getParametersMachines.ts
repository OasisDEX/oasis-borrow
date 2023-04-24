import {
  AdjustAaveParameters,
  CloseAaveParameters,
  getAdjustAaveParameters,
  getCloseAaveParameters,
  getManageAaveParameters,
  getOpenDepositBorrowParameters,
  getOpenTransaction,
  ManageAaveParameters,
  OpenAaveDepositBorrowParameters,
  OpenMultiplyAaveParameters,
} from 'actions/aave'
import { TxHelpers } from 'components/AppContext'
import { createTransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import { HasGasEstimation } from 'helpers/form'
import { Observable } from 'rxjs'

export function getOpenMultiplyAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    async (parameters: OpenMultiplyAaveParameters) => {
      try {
        return await getOpenTransaction(parameters)
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    'open',
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
    'close',
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
    'adjust',
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
    'depositBorrow',
  )
}

export function getOpenDepositBorrowAaveMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: OpenAaveDepositBorrowParameters) => getOpenDepositBorrowParameters(parameters),
    'openDepositBorrow',
  )
}
