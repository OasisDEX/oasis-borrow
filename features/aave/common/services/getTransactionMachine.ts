import { Observable } from 'rxjs'

import {
  callOperationExecutor,
  OperationExecutorTxMeta,
} from '../../../../blockchain/calls/operationExecutor'
import { ContextConnected } from '../../../../blockchain/network'
import { TxHelpers } from '../../../../components/AppContext'
import {
  CommonTransactionServices,
  createTransactionStateMachine,
  startTransactionService,
} from '../../../stateMachines/transaction'

export function getOpenAaveTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  commonTransactionServices: CommonTransactionServices,
  transactionParameters: OperationExecutorTxMeta,
) {
  const service = startTransactionService<OperationExecutorTxMeta>(txHelpers$, context$)
  return createTransactionStateMachine(callOperationExecutor, transactionParameters).withConfig({
    services: {
      ...commonTransactionServices,
      startTransaction: service,
    },
  })
}
