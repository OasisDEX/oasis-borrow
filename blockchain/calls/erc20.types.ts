import type { BigNumber } from 'bignumber.js'

import type { TxMetaKind } from './txMeta'

export interface TokenBalanceArgs {
  token: string
  account: string
}

export interface TokenBalanceFromAddressArgs {
  account: string
  address: string
  precision: number
}

export interface TokenBalanceRawForJoinArgs {
  tokenAddress: string
  ilk: string
}
export interface TokenAllowanceArgs {
  token: string
  owner: string
  spender: string
}

export type ApproveData = {
  kind: TxMetaKind.approve
  token: string
  spender: string
  amount: BigNumber
}

export type DisapproveData = {
  kind: TxMetaKind.disapprove
  token: string
  spender: string
}
