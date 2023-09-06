import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { ContextConnected } from 'blockchain/network'
import {
  CommonTransactionServices,
  createTransactionStateMachine,
  startTransactionService,
} from 'features/stateMachines/transaction'
import { TxHelpers } from 'helpers/context/types'
import { Observable } from 'rxjs'

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
