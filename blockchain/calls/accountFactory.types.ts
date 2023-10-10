import type { TxMeta } from '@oasisdex/transactions'

import type { TxMetaKind } from './txMeta'

export interface CreateDPMAccount extends TxMeta {
  kind: TxMetaKind.createAccount
}
