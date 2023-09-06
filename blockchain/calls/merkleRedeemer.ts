import { BigNumber } from 'bignumber.js'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { BytesLike } from 'ethers'
import { MerkleRedeemer } from 'types/web3-v1-contracts'

export interface CanClaimArgs {
  proof: Array<BytesLike>
  week: BigNumber
  amount: BigNumber
}

export type ClaimMultipleData = {
  kind: TxMetaKind.claimReferralFees
  weeks: any
  amounts: any
  proofs: any
}

export const claimMultiple: TransactionDef<ClaimMultipleData> = {
  call: (_, { contract }) => {
    // Claims are on the optimism only
    return contract<MerkleRedeemer>(getNetworkContracts(NetworkIds.OPTIMISMMAINNET).merkleRedeemer)
      .methods.claimMultiple
  },
  prepareArgs: (data) => {
    const { weeks, amounts, proofs } = data

    return [weeks, amounts, proofs]
  },
}
