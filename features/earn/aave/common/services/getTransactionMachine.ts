import { Observable } from 'rxjs'
import { escalate } from 'xstate/lib/actions'

import {
  callOperationExecutor,
  OperationExecutorTxMeta,
} from '../../../../../blockchain/calls/operationExecutor'
import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import {
  createTransactionStateMachine,
  startTransactionService,
} from '../../../../stateMachines/transaction'

export function getOpenAaveTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
) {
  const service = startTransactionService<OperationExecutorTxMeta>(txHelpers$, context$)
  return createTransactionStateMachine(callOperationExecutor).withConfig({
    services: {
      startTransaction: service,
    },
    actions: {
      notifyParent: () => {},
      raiseError: escalate((context) => ({ data: context.txError })),
    },
  })
}
