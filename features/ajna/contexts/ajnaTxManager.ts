import { TxStatus } from '@oasisdex/transactions'

export function getTxStatuses(txStatus?: TxStatus) {
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
