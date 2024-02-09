import type {
  AdjustAaveParameters,
  CloseAaveParameters,
  ManageAaveParameters,
  MigrateAaveLikeParameters,
} from 'actions/aave-like'
import {
  getAdjustPositionParameters,
  getCloseAaveParameters,
  getManagePositionParameters,
  getMigrationPositionParameters,
} from 'actions/aave-like'
import type { NetworkIds } from 'blockchain/networks'
import {
  createTransactionParametersStateMachine,
  createTransactionParametersV2StateMachine,
} from 'features/stateMachines/transactionParameters'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { Observable } from 'rxjs'

export function getCloseAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  networkId: NetworkIds,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    (parameters: CloseAaveParameters) => getCloseAaveParameters(parameters),
    networkId,
    'close',
  )
}

export function getAdjustAaveParametersMachine(
  txHelpers$: Observable<TxHelpers>,
  networkId: NetworkIds,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    (parameters: AdjustAaveParameters) => getAdjustPositionParameters(parameters),
    networkId,
    'adjust',
  )
}

export function getDepositBorrowAaveMachine(
  txHelpers$: Observable<TxHelpers>,
  networkId: NetworkIds,
) {
  return createTransactionParametersStateMachine(
    txHelpers$,
    (parameters: ManageAaveParameters) => getManagePositionParameters(parameters),
    networkId,
    'depositBorrow',
  )
}

export function getMigratePositionParametersMachine(networkId: NetworkIds) {
  return createTransactionParametersV2StateMachine(
    (parameters: MigrateAaveLikeParameters) => getMigrationPositionParameters(parameters),
    networkId,
  )
}
