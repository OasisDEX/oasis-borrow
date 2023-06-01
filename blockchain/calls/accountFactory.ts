import { TxMeta } from '@oasisdex/transactions'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import { AccountFactory } from 'types/web3-v1-contracts'

import { TxMetaKind } from './txMeta'

export interface CreateDPMAccount extends TxMeta {
  kind: TxMetaKind.createAccount
}

export const createAccount: TransactionDef<CreateDPMAccount> = {
  call: (_, { contract, chainId }) => {
    const contracts = getNetworkContracts(chainId)
    ensureContractsExist(chainId, contracts, ['accountFactory'])
    const { accountFactory } = contracts
    return contract<AccountFactory>(accountFactory).methods['createAccount()']
  },
  prepareArgs: () => [],
}
