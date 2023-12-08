import { amountFromWei, amountToWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import * as erc20 from 'blockchain/abi/erc20.json'
import { getNetworkContracts } from 'blockchain/contracts'
import { contractDesc, getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { Erc20__factory } from 'types/ethers-contracts'
import type { Erc20 } from 'types/web3-v1-contracts'

import type { CallDef, TransactionDef } from './callsHelpers'
import type {
  ApproveData,
  DisapproveData,
  TokenAllowanceArgs,
  TokenBalanceArgs,
  TokenBalanceFromAddressArgs,
  TokenBalanceRawForJoinArgs,
} from './erc20.types'

export const tokenBalance: CallDef<TokenBalanceArgs, BigNumber> = {
  call: ({ token }, { contract, chainId }) =>
    contract<Erc20>(getNetworkContracts(NetworkIds.MAINNET, chainId).tokens[token]).methods
      .balanceOf,
  prepareArgs: ({ account }) => [account],
  postprocess: (result, { token }) =>
    amountFromWei(new BigNumber(result), getToken(token).precision),
}

export const getTokenBalanceFromAddress = async ({
  address,
  account,
  precision,
  networkId,
}: {
  address: string
  account: string
  precision: number
  networkId: NetworkIds
}) => {
  const provider = getRpcProvider(networkId)
  const rawResult = await Erc20__factory.connect(address, provider).balanceOf(account)

  return amountFromWei(new BigNumber(rawResult.toString()), precision)
}

export const tokenBalanceFromAddress: CallDef<TokenBalanceFromAddressArgs, BigNumber> = {
  call: ({ address }, { contract }) => contract<Erc20>({ abi: erc20, address }).methods.balanceOf,
  prepareArgs: ({ account }) => [account],
  postprocess: (result, { precision }) => amountFromWei(new BigNumber(result), precision),
}

export const tokenBalanceRawForJoin: CallDef<TokenBalanceRawForJoinArgs, BigNumber> = {
  call: ({ tokenAddress }, { contract }) => {
    const cd = contractDesc(erc20, tokenAddress)
    return contract<Erc20>(cd).methods.balanceOf
  },
  prepareArgs: ({ ilk }, { chainId }) => [
    getNetworkContracts(NetworkIds.MAINNET, chainId).joins[ilk],
  ],
  postprocess: (result) => new BigNumber(result),
}

export const tokenAllowance: CallDef<TokenAllowanceArgs, BigNumber> = {
  call: ({ token }, { contract, chainId }) =>
    contract<Erc20>(getNetworkContracts(NetworkIds.MAINNET, chainId).tokens[token]).methods
      .allowance,
  prepareArgs: ({ owner, spender }) => [owner, spender],
  postprocess: (result: any) => amountFromWei(new BigNumber(result)),
}

export const approve: TransactionDef<ApproveData> = {
  call: ({ token }, { chainId, contract }) =>
    contract<Erc20>(getNetworkContracts(NetworkIds.MAINNET, chainId).tokens[token]).methods.approve,
  prepareArgs: ({ spender, amount }) => [spender, amountToWei(amount).toFixed(0)],
}

export const disapprove: TransactionDef<DisapproveData> = {
  call: ({ token }, { chainId, contract }) =>
    contract<Erc20>(getNetworkContracts(NetworkIds.MAINNET, chainId).tokens[token]).methods.approve,
  prepareArgs: ({ spender }) => [spender, 0],
}

export const tokenDecimals: CallDef<string, BigNumber> = {
  call: (address, { contract }) => contract<Erc20>({ abi: erc20, address }).methods.decimals,
  prepareArgs: () => [],
  postprocess: (decimals: any) => new BigNumber(decimals),
}

export const tokenSymbol: CallDef<string, string> = {
  call: (address, { contract }) => contract<Erc20>({ abi: erc20, address }).methods.symbol,
  prepareArgs: () => [],
}

export const tokenName: CallDef<string, string> = {
  call: (address, { contract }) => contract<Erc20>({ abi: erc20, address }).methods.name,
  prepareArgs: () => [],
}
