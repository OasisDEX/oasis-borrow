import { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { BytesLike } from 'ethers'
import { MerkleRedeemer } from 'types/web3-v1-contracts'

import { TransactionDef } from './callsHelpers'
import { TxMetaKind } from './txMeta'

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
  call: (_, { contract, chainId }) => {
    return contract<MerkleRedeemer>(getNetworkContracts(chainId).merkleRedeemer).methods
      .claimMultiple
  },
  prepareArgs: (data) => {
    const { weeks, amounts, proofs } = data
    return [weeks, amounts, proofs]
  },
}
