import { approve } from 'blockchain/calls/erc20'
import { ContextConnected } from 'blockchain/network'
import {
  CommonTransactionServices,
  createTransactionStateMachine,
  startTransactionService,
} from 'features/stateMachines/transaction'
import { TxHelpers } from 'helpers/context/types'
import { Observable } from 'rxjs'

import { AllowanceTxMeta, createAllowanceStateMachine } from './state/createAllowanceStateMachine'

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
