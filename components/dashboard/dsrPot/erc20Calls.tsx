import { amountToWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { TransactionDef } from 'components/blockchain/calls/callsHelpers'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import { getToken } from 'components/blockchain/config'

export type ApproveData = {
  kind: TxMetaKind.approve
  token: string
  spender: string
}

export const approve: TransactionDef<ApproveData> = {
  call: ({ token }, { tokens, contract }) =>
    contract(tokens[token]).methods['approve(address,uint256)'],
  prepareArgs: ({ spender }) => [spender, -1],
}

export type DisapproveData = {
  kind: TxMetaKind.disapprove
  token: string
  spender: string
}
export const disapprove: TransactionDef<DisapproveData> = {
  call: ({ token }, { tokens, contract }) =>
    contract(tokens[token]).methods['approve(address,uint256)'],
  prepareArgs: ({ spender }) => [spender, 0],
}

export type TransferErc20Data = {
  kind: TxMetaKind.transferErc20
  token: string
  address: string
  amount: BigNumber
}
export const transferErc20: TransactionDef<TransferErc20Data> = {
  call: ({ token }, { tokens, contract }) =>
    contract(tokens[token]).methods['transfer(address,uint256)'],
  prepareArgs: ({ token, address, amount }) => [
    address,
    amountToWei(amount, getToken(token).precision).toFixed(0),
  ],
}

export type TransferEthData = {
  kind: TxMetaKind.transferEth
  address: string
  amount: BigNumber
}
export const transferEth: TransactionDef<TransferEthData> = {
  prepareArgs: () => [],
  options: ({ address, amount }) => ({
    to: address,
    value: amountToWei(amount).toFixed(0),
  }),
}
