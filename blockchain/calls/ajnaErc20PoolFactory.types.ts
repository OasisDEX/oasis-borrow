import type { TxMeta } from '@oasisdex/transactions'
import type { TxMetaKind } from 'blockchain/calls/txMeta'

export interface DeployAjnaPoolTxData extends TxMeta {
  kind: TxMetaKind.deployAjnaPool
  collateralAddress: string
  quoteAddress: string
  interestRate: string
}
