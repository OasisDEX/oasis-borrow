import { TransactionDef } from './callsHelpers'
import { TxMetaKind } from './txMeta'
import { DsProxyRegistry } from 'types/web3-v1-contracts/ds-proxy-registry'

export type CreateDsProxyData = {
  kind: TxMetaKind.createDsProxy
}
export const createDsProxy: TransactionDef<CreateDsProxyData> = {
  call: (_, { dsProxyRegistry, contract }) =>
    contract<DsProxyRegistry>(dsProxyRegistry).methods.build,
  prepareArgs: () => [],
}
