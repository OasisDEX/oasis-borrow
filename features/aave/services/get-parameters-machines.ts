import {
  AdjustAaveParameters,
  CloseAaveParameters,
  getAdjustPositionParameters,
  getCloseAaveParameters,
  getManagePositionParameters,
  ManageAaveParameters,
} from 'actions/aave-like'
import { NetworkIds } from 'blockchain/networks'
import { createTransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import { HasGasEstimation, TxHelpers } from 'helpers/context/types'
import { Observable } from 'rxjs'

export function getCloseAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
  networkId: NetworkIds,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: CloseAaveParameters) => getCloseAaveParameters(parameters),
    networkId,
    'close',
  )
}

export function getAdjustAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
  networkId: NetworkIds,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: AdjustAaveParameters) => getAdjustPositionParameters(parameters),
    networkId,
    'adjust',
  )
}

export function getDepositBorrowAaveMachine(
  txHelpers$: Observable<TxHelpers>,
  gasPriceEstimation$: (gas: number) => Observable<HasGasEstimation>,
  networkId: NetworkIds,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    gasPriceEstimation$,
    (parameters: ManageAaveParameters) => getManagePositionParameters(parameters),
    networkId,
    'depositBorrow',
  )
}
