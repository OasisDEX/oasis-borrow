import { AdjustAaveParameters, CloseAaveParameters, ManageAaveParameters } from 'actions/aave'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import {
  createManageAaveStateMachine,
  ManageAaveStateMachine,
  ManageAaveStateMachineServices,
} from 'features/aave/manage/state'
import { AllowanceStateMachine } from 'features/stateMachines/allowance'
import { TransactionStateMachine } from 'features/stateMachines/transaction'
import { TransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'

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
