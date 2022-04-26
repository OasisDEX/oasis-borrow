import { TxStatus } from '@oasisdex/transactions'

export const progressStatuses = [
  TxStatus.WaitingForConfirmation,
  TxStatus.WaitingForApproval,
  TxStatus.Propagating,
]
