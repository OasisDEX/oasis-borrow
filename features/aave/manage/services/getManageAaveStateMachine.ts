import type {
  AdjustAaveParameters,
  CloseAaveParameters,
  ManageAaveParameters,
} from 'actions/aave-like'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import type {
  ManageAaveStateMachine,
  ManageAaveStateMachineServices,
} from 'features/aave/manage/state'
import { createManageAaveStateMachine } from 'features/aave/manage/state'
import type { MigrateAaveStateMachine } from 'features/aave/manage/state/migrateAaveStateMachine'
import type { AllowanceStateMachine } from 'features/stateMachines/allowance'
import type { TransactionStateMachine } from 'features/stateMachines/transaction'
import type { TransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'

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
  migrateAaveStateMachine: MigrateAaveStateMachine,
): ManageAaveStateMachine {
  return createManageAaveStateMachine(
    closeParametersMachine,
    adjustParametersMachine,
    allowanceMachine,
    transactionStateMachine,
    depositBorrowAaveMachine,
    migrateAaveStateMachine,
  ).withConfig({
    services: {
      ...services,
    },
  })
}
