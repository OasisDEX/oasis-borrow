import { approve } from 'blockchain/calls/erc20'
import type { ContextConnected } from 'blockchain/network.types'
import type { CommonTransactionServices } from 'features/stateMachines/transaction'
import {
  createTransactionStateMachine,
  startTransactionService,
} from 'features/stateMachines/transaction'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { Observable } from 'rxjs'

import type { AllowanceTxMeta } from './state/createAllowanceStateMachine'
import { createAllowanceStateMachine } from './state/createAllowanceStateMachine'

export function getAllowanceStateMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  commonTransactionServices: CommonTransactionServices,
) {
  function transactionMachine(transactionParameters: AllowanceTxMeta) {
    const service = startTransactionService<AllowanceTxMeta>(txHelpers$, context$)
    return createTransactionStateMachine(approve, transactionParameters).withConfig({
      services: {
        ...commonTransactionServices,
        startTransaction: service,
      },
    })
  }

  return createAllowanceStateMachine(transactionMachine)
}
