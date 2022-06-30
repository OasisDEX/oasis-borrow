import { TxStatus } from '@oasisdex/transactions'

export const progressStatuses = [
  TxStatus.WaitingForConfirmation,
  TxStatus.WaitingForApproval,
  TxStatus.Propagating,
]

export const failedStatuses = [TxStatus.Failure, TxStatus.CancelledByTheUser, TxStatus.Error]
