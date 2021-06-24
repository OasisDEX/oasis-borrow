import { amountFromWei, amountToWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import { Erc20 } from 'types/web3-v1-contracts/erc20'

import { getToken } from '../tokensMetadata'
import { CallDef, TransactionDef } from './callsHelpers'
import { TxMetaKind } from './txMeta'

export const MIN_ALLOWANCE = new BigNumber('0xffffffffffffffffffffffffffffffff')
//
export const maxUint256 = amountFromWei(
  new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16),
)

export interface TokenBalanceArgs {
  token: string
  account: string
}

export const tokenBalance: CallDef<TokenBalanceArgs, BigNumber> = {
  call: ({ token }, { contract, tokens }) => contract<Erc20>(tokens[token]).methods.balanceOf,
  prepareArgs: ({ account }) => [account],
  postprocess: (result, { token }) =>
    amountFromWei(new BigNumber(result), getToken(token).precision),
}

interface TokenAllowanceArgs {
  token: string
  owner: string
  spender: string
}

export const tokenAllowance: CallDef<TokenAllowanceArgs, BigNumber> = {
  call: ({ token }, { contract, tokens }) => contract<Erc20>(tokens[token]).methods.allowance,
  prepareArgs: ({ owner, spender }) => [owner, spender],
  postprocess: (result: any) => amountFromWei(new BigNumber(result)),
}

export type ApproveData = {
  kind: TxMetaKind.approve
  token: string
  spender: string
  amount: BigNumber
}

export const approve: TransactionDef<ApproveData> = {
  call: ({ token }, { tokens, contract }) => contract<Erc20>(tokens[token]).methods.approve,
  prepareArgs: ({ spender, amount }) => [spender, amountToWei(amount).toFixed(0)],
}

export type DisapproveData = {
  kind: TxMetaKind.disapprove
  token: string
  spender: string
}

export const disapprove: TransactionDef<DisapproveData> = {
  call: ({ token }, { tokens, contract }) => contract<Erc20>(tokens[token]).methods.approve,
  prepareArgs: ({ spender }) => [spender, 0],
}
