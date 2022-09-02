import { Observable } from 'rxjs'
import { escalate } from 'xstate/lib/actions'

import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import {
  createTransactionStateMachine,
  startTransactionService,
} from '../../../../stateMachines/transaction'
import { openAavePosition, OpenAavePositionData } from '../pipelines/openAavePosition'

export function getOpenAaveTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
) {
  const service = startTransactionService<OpenAavePositionData>(txHelpers$, context$)
  return createTransactionStateMachine(openAavePosition).withConfig({
    services: {
      startTransaction: service,
    },
    actions: {
      notifyParent: () => {},
      raiseError: escalate((context) => ({ data: context.txError })),
    },
  })
}
