import {
  AdjustAaveParameters,
  CloseAaveParameters,
  getAdjustPositionParameters,
  getCloseAaveParameters,
  getManagePositionParameters,
  getOpenDepositBorrowPositionParameters,
  ManageAaveParameters,
  OpenAaveDepositBorrowParameters,
} from 'actions/aave'
import { NetworkIds } from 'blockchain/networks'
import { TxHelpers } from 'components/AppContext'
import { createTransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import { HasGasEstimation } from 'helpers/form'
import { Observable } from 'rxjs'

export function getCloseAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: CloseAaveParameters) => getCloseAaveParameters(parameters),
    NetworkIds.MAINNET,
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
    (parameters: AdjustAaveParameters) => getAdjustPositionParameters(parameters),
    NetworkIds.MAINNET,
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
    (parameters: ManageAaveParameters) => getManagePositionParameters(parameters),
    NetworkIds.MAINNET,
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
    (parameters: OpenAaveDepositBorrowParameters) =>
      getOpenDepositBorrowPositionParameters(parameters),
    NetworkIds.MAINNET,
    'openDepositBorrow',
  )
}
