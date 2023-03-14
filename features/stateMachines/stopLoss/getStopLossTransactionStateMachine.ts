import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { ContextConnected } from 'blockchain/network'
import { AutomationTxData, TxHelpers } from 'components/AppContext'
import {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
} from 'features/automation/common/txDefinitions'
import {
  CommonTransactionServices,
  createTransactionStateMachine,
  startTransactionService,
} from 'features/stateMachines/transaction'
import { Observable } from 'rxjs'

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
