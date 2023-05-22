import { TxMeta } from '@oasisdex/transactions'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { AccountFactory } from 'types/web3-v1-contracts'

import { TxMetaKind } from './txMeta'

export interface CreateDPMAccount extends TxMeta {
  kind: TxMetaKind.createAccount
}

export const createAccount: TransactionDef<CreateDPMAccount> = {
  call: (_, { contract, chainId }) =>
    contract<AccountFactory>(getNetworkContracts(NetworkIds.MAINNET, chainId).accountFactory)
      .methods['createAccount()'],
  prepareArgs: () => [],
}
