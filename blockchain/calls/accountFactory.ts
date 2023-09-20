import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { AccountFactory } from 'types/web3-v1-contracts'

import type { CreateDPMAccount } from './accountFactory.types'

export const createAccount: TransactionDef<CreateDPMAccount> = {
  call: (_, { contract, chainId }) => {
    const contracts = getNetworkContracts(chainId)
    ensureContractsExist(chainId, contracts, ['accountFactory'])
    const { accountFactory } = contracts
    return contract<AccountFactory>(accountFactory).methods['createAccount()']
  },
  prepareArgs: () => [],
}
