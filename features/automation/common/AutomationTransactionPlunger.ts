import { TxState, TxStatus } from '@oasisdex/transactions'
import {
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
} from 'blockchain/calls/automationBot'
import { Subscription } from 'rxjs'

export function isTxStatusFinal(status: TxStatus) {
  return (
    status === TxStatus.CancelledByTheUser ||
    status === TxStatus.Failure ||
    status === TxStatus.Error ||
    status === TxStatus.Success
  )
}

export function isTxStatusFailed(status: TxStatus) {
  return isTxStatusFinal(status) && status !== TxStatus.Success
}

// TODO ŁW - do something to simplify returned type, unfortunately AutomationBaseTriggerData didn't worked
// Maybe add something to AutomationBaseTriggerData to make it have kind which is unspecified
// Tried to solve it by adding   kind: TxMetaKind.addTrigger | TxMetaKind.removeTrigger to AutomationBaseTriggerData
// This messed up prepareTriggerData which is perfectly fine without any kind at all
export function handleFinalTransaction(
  transactionState: TxState<AutomationBotAddTriggerData | AutomationBotRemoveTriggerData>,
  finishLoader: (succeded: boolean) => void,
  waitForTx: Subscription,
  txStatusSetter: React.Dispatch<React.SetStateAction<TxState<any> | undefined>>,
) {
  if (isTxStatusFailed(transactionState.status)) {
    finishLoader(false)
    waitForTx.unsubscribe()
    txStatusSetter(undefined)
  } else {
    finishLoader(true)
    waitForTx.unsubscribe()
    txStatusSetter(undefined)
  }
}
