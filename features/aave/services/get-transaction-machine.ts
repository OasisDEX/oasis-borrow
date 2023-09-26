import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import type { ContextConnected } from 'blockchain/network.types'
import type { CommonTransactionServices } from 'features/stateMachines/transaction'
import {
  createTransactionStateMachine,
  startTransactionService,
} from 'features/stateMachines/transaction'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { Observable } from 'rxjs'

export function getOperationExecutorTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  commonTransactionServices: CommonTransactionServices,
  transactionParameters: OperationExecutorTxMeta,
  transactionDef: TransactionDef<OperationExecutorTxMeta>,
) {
  const service = startTransactionService<OperationExecutorTxMeta, unknown>(txHelpers$, context$)
  return createTransactionStateMachine(transactionDef, transactionParameters).withConfig({
    services: {
      ...commonTransactionServices,
      startTransaction: service,
    },
  })
}
