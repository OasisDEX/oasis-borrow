import { TxMeta } from '@oasisdex/transactions'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { AjnaRewardsClaimer } from 'types/web3-v1-contracts'

export interface ClaimAjnaRewardsTxData extends TxMeta {
  kind: TxMetaKind.claimAjnaRewards
  nftIds: string[]
}

export const claimAjnaRewards: TransactionDef<ClaimAjnaRewardsTxData> = {
  call: (_, { contract, chainId }) => {
    return contract<AjnaRewardsClaimer>(
      getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaRewardsClaimer,
    ).methods.claimRewardsAndSendToOwner
  },
  prepareArgs: (data) => {
    const { nftIds } = data

    return [nftIds]
  },
}
