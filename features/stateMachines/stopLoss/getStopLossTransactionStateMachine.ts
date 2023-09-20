import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { ContextConnected } from 'blockchain/network'
import type {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
} from 'features/automation/common/txDefinitions'
import type {
  CommonTransactionServices } from 'features/stateMachines/transaction';
import {
  createTransactionStateMachine,
  startTransactionService,
} from 'features/stateMachines/transaction'
import type { AutomationTxData, TxHelpers } from 'helpers/context/types'
import type { Observable } from 'rxjs'

export function getStopLossTransactionStateMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  commonTransactionServices: CommonTransactionServices,
) {
  return function transactionMachine(
    txData: AutomationAddTriggerData,
    addTriggerDef: AutomationAddTriggerTxDef,
  ) {
    const service = startTransactionService<AutomationTxData>(txHelpers$, context$)
    return createTransactionStateMachine(
      addTriggerDef as TransactionDef<AutomationTxData>,
      txData as AutomationTxData,
    ).withConfig({
      services: {
        ...commonTransactionServices,
        startTransaction: service,
      },
    })
  }
}
