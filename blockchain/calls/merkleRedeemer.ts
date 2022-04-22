
import { BigNumber } from 'bignumber.js'
import { BytesLike } from 'ethers'
import { MerkleRedeemer } from 'types/ethers-contracts/MerkleRedeemer'

import { CallDef } from './callsHelpers'
import { TxMetaKind } from './txMeta'

export interface CanClaimArgs {
  proof: Array<BytesLike>
  week: BigNumber
  amount: BigNumber
}

export interface ClaimMultipleArgs {
  kind: TxMetaKind.claim
  weeks: BigNumber[]
  amounts: BigNumber[]
  proofs: string[][]
}

export const canClaim: CallDef<CanClaimArgs, boolean> = {
  call: (_, { contract, merkleRedeemer }) => contract<MerkleRedeemer>(merkleRedeemer).canClaim,
  prepareArgs: () => [],
  postprocess: (result) => result,
}

export const currentWeek: CallDef<null, BigNumber> = {
  call: (_, { contract, merkleRedeemer }) =>
    contract<MerkleRedeemer>(merkleRedeemer).getCurrentWeek,
  prepareArgs: () => [],
  postprocess: (result) => result,
}
