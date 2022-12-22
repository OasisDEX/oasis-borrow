import { TransactionDef } from '../../../../blockchain/calls/callsHelpers'
import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { AllowanceStateMachine } from '../../../stateMachines/allowance'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { TransactionParametersStateMachine } from '../../../stateMachines/transactionParameters'
import {
  AdjustAaveParameters,
  CloseAaveParameters,
  ManageAaveParameters,
} from '../../oasisActionsLibWrapper'
import {
  createManageAaveStateMachine,
  ManageAaveStateMachine,
  ManageAaveStateMachineServices,
} from '../state'

export function getManageAaveStateMachine(
  services: ManageAaveStateMachineServices,
  closeParametersMachine: TransactionParametersStateMachine<CloseAaveParameters>,
  adjustParametersMachine: TransactionParametersStateMachine<AdjustAaveParameters>,
  allowanceMachine: AllowanceStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
    transactionDef: TransactionDef<OperationExecutorTxMeta>,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
  depositBorrowAaveMachine: TransactionParametersStateMachine<ManageAaveParameters>,
): ManageAaveStateMachine {
  return createManageAaveStateMachine(
    closeParametersMachine,
    adjustParametersMachine,
    allowanceMachine,
    transactionStateMachine,
    depositBorrowAaveMachine,
  ).withConfig({
    services: {
      ...services,
    },
  })
}
