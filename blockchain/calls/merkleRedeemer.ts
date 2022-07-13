import { BigNumber } from 'bignumber.js'
import { BytesLike } from 'ethers'
import { MerkleRedeemer } from 'types/ethers-contracts/MerkleRedeemer'

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
  call: (_, { contract, merkleRedeemer }) => {
    return contract<MerkleRedeemer>(merkleRedeemer).methods.claimMultiple
  },
  prepareArgs: (data) => {
    const { weeks, amounts, proofs } = data
    return [weeks, amounts, proofs]
  },
}
