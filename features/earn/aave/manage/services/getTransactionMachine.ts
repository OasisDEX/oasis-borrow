import { Observable } from 'rxjs'
import { escalate } from 'xstate/lib/actions'

import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import {
  createTransactionStateMachine,
  startTransactionService,
  TransactionStateMachine,
} from '../../../../stateMachines/transaction'
import { manageAavePosition, ManageAavePositionData } from '../pipelines/manageAavePosition'

export function getManageAaveTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
): TransactionStateMachine<ManageAavePositionData> {
  const startTransaction = startTransactionService<ManageAavePositionData>(txHelpers$, context$)
  return createTransactionStateMachine(manageAavePosition).withConfig({
    actions: {
      notifyParent: () => {},
      raiseError: escalate((context) => ({ data: context.txError })),
    },
    services: {
      startTransaction: startTransaction,
    },
  })
}
