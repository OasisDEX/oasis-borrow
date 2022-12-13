import { Observable } from 'rxjs'

import { createAccount, CreateDPMAccount } from '../../../../blockchain/calls/accountFactory'
import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../blockchain/network'
import { TxHelpers } from '../../../../components/AppContext'
import {
  CommonTransactionServices,
  createTransactionStateMachine,
  startTransactionService,
} from '../../transaction'

export function getCreateDPMAccountTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
  commonTransactionServices: CommonTransactionServices,
) {
  const service = startTransactionService<CreateDPMAccount>(txHelpers$, context$)
  return createTransactionStateMachine<CreateDPMAccount>(createAccount, {
    kind: TxMetaKind.createAccount,
  }).withConfig({
    services: {
      ...commonTransactionServices,
      startTransaction: service,
    },
  })
}
