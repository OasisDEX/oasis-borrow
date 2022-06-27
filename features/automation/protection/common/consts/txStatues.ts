import { TxStatus } from '@oasisdex/transactions'

export const progressStatuses = [
  TxStatus.WaitingForConfirmation,
  TxStatus.WaitingForApproval,
  TxStatus.Propagating,
]
// TODO ŁW this statuses are going to be common for both protection and optimization
// change package or move to common
export const failedStatuses = [TxStatus.Failure, TxStatus.CancelledByTheUser, TxStatus.Error]
