import type { AjnaTxData } from 'actions/ajna'
import type { TxMetaKind } from 'blockchain/calls/txMeta'

export interface OasisActionCallData extends AjnaTxData {
  kind: TxMetaKind.libraryCall
  proxyAddress: string
}
