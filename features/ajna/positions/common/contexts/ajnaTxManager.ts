import { TxStatus } from '@oasisdex/transactions'

export interface TxStatuses {
  isTxStarted: boolean
  isTxError: boolean
  isTxWaitingForApproval: boolean
  isTxInProgress: boolean
  isTxSuccess: boolean
}

export function getTxStatuses(txStatus?: TxStatus): TxStatuses {
  return {
    isTxStarted: !!txStatus,
    isTxError:
      txStatus === TxStatus.CancelledByTheUser ||
      txStatus === TxStatus.Error ||
      txStatus === TxStatus.Failure,
    isTxWaitingForApproval: txStatus === TxStatus.WaitingForApproval,
    isTxInProgress:
      txStatus === TxStatus.Propagating || txStatus === TxStatus.WaitingForConfirmation,
    isTxSuccess: txStatus === TxStatus.Success,
  }
}
