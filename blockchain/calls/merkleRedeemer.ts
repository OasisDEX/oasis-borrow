import type { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { BytesLike } from 'ethers'
import type { MerkleRedeemer } from 'types/web3-v1-contracts'

import type { TransactionDef } from './callsHelpers'
import type { TxMetaKind } from './txMeta'

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
