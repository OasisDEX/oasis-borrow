import { TxMeta } from '@oasisdex/transactions'
import { getNetworkContracts } from 'blockchain/contracts'
import { AjnaRewardsClaimer } from 'types/web3-v1-contracts'

import { TransactionDef } from './callsHelpers'
import { TxMetaKind } from './txMeta'

export interface ClaimAjnaRewardsTxData extends TxMeta {
  kind: TxMetaKind.claimAjnaRewards
  nftIds: string[]
}

export const claimAjnaRewards: TransactionDef<ClaimAjnaRewardsTxData> = {
  call: (_, { contract, chainId }) => {
    return contract<AjnaRewardsClaimer>(getNetworkContracts(chainId).ajnaRewardsClaimer).methods
      .claimRewardsAndSendToOwner
  },
  prepareArgs: (data) => {
    const { nftIds } = data
    return [nftIds]
  },
}
