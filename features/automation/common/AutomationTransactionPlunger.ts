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

export function transactionStateHandler(
  txStatusSetter: React.Dispatch<React.SetStateAction<TxState<any> | undefined>>,
  transactionState: TxState<AutomationBotAddTriggerData | AutomationBotRemoveTriggerData>,
  finishLoader: (succeded: boolean) => void,
  waitForTx: Subscription,
) {
  txStatusSetter(transactionState)
  if (isTxStatusFinal(transactionState.status)) {
    handleFinalTransaction(transactionState, finishLoader, waitForTx, txStatusSetter)
  }
}

function handleFinalTransaction(
  transactionState: TxState<AutomationBotAddTriggerData | AutomationBotRemoveTriggerData>,
  finishLoader: (succeded: boolean) => void,
  waitForTx: Subscription,
  txStatusSetter: React.Dispatch<React.SetStateAction<TxState<any> | undefined>>,
) {
  if (isTxStatusFailed(transactionState.status)) {
    finishLoader(false)
    resetStatus()
  } else {
    finishLoader(true)
    resetStatus()
  }
  function resetStatus() {
    waitForTx.unsubscribe()
    txStatusSetter(undefined)
  }
}
