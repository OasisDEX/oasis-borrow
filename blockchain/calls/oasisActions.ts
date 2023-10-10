import type { TxMeta } from '@oasisdex/transactions'
import * as accountImplementation from 'blockchain/abi/account-implementation.json'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { TxMetaKind } from 'blockchain/calls/txMeta'
import { contractDesc } from 'blockchain/networks'
import type { AccountImplementation } from 'types/web3-v1-contracts'

export interface OasisActionsTxData extends TxMeta {
  kind: TxMetaKind.libraryCall
  proxyAddress: string
  data: string
  to: string
  value: string
}

export const callOasisActionsWithDpmProxy: TransactionDef<OasisActionsTxData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<AccountImplementation>(contractDesc(accountImplementation, proxyAddress))
      .methods['execute']
  },
  prepareArgs: ({ data, to }) => {
    return [to, data]
  },
  options: ({ value }) => ({
    value: value,
  }),
}
