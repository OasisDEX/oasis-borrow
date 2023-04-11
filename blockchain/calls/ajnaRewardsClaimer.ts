import { TxMeta } from '@oasisdex/transactions'
import { AjnaRewardsClaimer } from 'types/web3-v1-contracts'

import { TransactionDef } from './callsHelpers'
import { TxMetaKind } from './txMeta'

export interface ClaimAjnaRewardsTxData extends TxMeta {
  kind: TxMetaKind.claimAjnaRewards
  nftIds: any
}

export const claimAjnaRewards: TransactionDef<ClaimAjnaRewardsTxData> = {
  call: (_, { contract, ajnaRewardsClaimer }) => {
    return contract<AjnaRewardsClaimer>(ajnaRewardsClaimer).methods.claimRewardsAndSendToOwner
  },
  prepareArgs: (data) => {
    const { nftIds } = data
    return [nftIds]
  },
}
