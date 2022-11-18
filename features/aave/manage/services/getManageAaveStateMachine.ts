import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { TransactionParametersStateMachine } from '../../../stateMachines/transactionParameters'
import { AdjustAaveParameters, CloseAaveParameters } from '../../oasisActionsLibWrapper'
import {
  createManageAaveStateMachine,
  ManageAaveStateMachine,
  ManageAaveStateMachineServices,
} from '../state'

export function getManageAaveStateMachine(
  services: ManageAaveStateMachineServices,
  closeParametersMachine: TransactionParametersStateMachine<CloseAaveParameters>,
  adjustParametersMachine: TransactionParametersStateMachine<AdjustAaveParameters>,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
): ManageAaveStateMachine {
  return createManageAaveStateMachine(
    closeParametersMachine,
    adjustParametersMachine,
    transactionStateMachine,
  ).withConfig({
    services: {
      ...services,
    },
  })
}
